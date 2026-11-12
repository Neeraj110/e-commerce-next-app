import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "@/models/order.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";
import Product from "@/models/product.model";
import Cart from "@/models/card.model";
import { invalidateCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  await connectDb();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Please login first" },
      { status: 401 }
    );
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
  } = body;

  // Verify payment signature first (outside transaction — cheap, stateless)
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(sign)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  // Confirm the pending order exists before entering the transaction
  const existingOrder = await Order.findOne({
    _id: order_id,
    user: user._id,
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (existingOrder.paymentStatus === "completed") {
    return NextResponse.json(
      { error: "Payment already processed" },
      { status: 400 }
    );
  }

  if (existingOrder.razorpay_order_id !== razorpay_order_id) {
    return NextResponse.json(
      { error: "Payment order does not match the pending order" },
      { status: 400 }
    );
  }

  // ── Mongoose transaction: atomic stock deduction + order status update ──
  const dbSession = await mongoose.startSession();
  let updatedOrder: any;

  try {
    await dbSession.withTransaction(async () => {
      // Deduct stock for every item concurrently inside the transaction
      const stockUpdates = existingOrder.items.map((item: any) =>
        Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session: dbSession }
        )
      );

      const results = await Promise.all(stockUpdates);

      // If any product had insufficient stock, abort the whole transaction
      const outOfStock = results.some((r) => r === null);
      if (outOfStock) {
        throw Object.assign(new Error("One or more items are out of stock"), {
          statusCode: 409,
        });
      }

      const trackingNumber = `TRK${Math.floor(Math.random() * 1_000_000)}`;

      updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order_id,
          user: user._id,
          paymentStatus: { $ne: "completed" },
        },
        {
          $set: {
            paymentStatus: "completed",
            status: "processing",
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            trackingNumber,
            paidAt: new Date(),
          },
        },
        { new: true, session: dbSession }
      );

      if (!updatedOrder) {
        throw new Error("Failed to update order");
      }
    });
  } catch (err: any) {
    await dbSession.endSession();
    console.error("Payment verification error:", err);

    const status = err.statusCode ?? 500;
    return NextResponse.json(
      { error: err.message || "Payment verification failed" },
      { status }
    );
  }

  await dbSession.endSession();

  // Clear cart in DB & invalidate Redis cache (outside transaction — best-effort)
  await Cart.findOneAndDelete({ user: user._id });
  await invalidateCache(`cart_${user._id}`);

  return NextResponse.json({
    message: "Payment verified successfully",
    order: updatedOrder,
  });
}
