import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Order from "@/models/order.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await getServerSession({ req, ...authOptions });
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

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(sign)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.log("Signature mismatch:", {
        generated_signature,
        razorpay_signature,
      });
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find the order
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

    const trackingNumber = `TRK${Math.floor(Math.random() * 1000000)}`;

    // Update the order
    const updatedOrder = await Order.findOneAndUpdate(
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
          trackingNumber: trackingNumber,
          paidAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
