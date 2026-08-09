// src/app/api/payments/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import connectDb from "@/config/connectDb";
import Order from "@/models/order.model";
import User from "@/models/user.model";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  throw new Error(
    "Please define RAZORPAY_KEY_ID and RAZORPAY_SECRET in your .env.local file"
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orderDoc = await Order.findOne({
      _id: orderId,
      user: user._id,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
    }).select("_id totalAmount razorpay_order_id");

    if (!orderDoc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (orderDoc.razorpay_order_id) {
      return NextResponse.json(
        { error: "Payment order already created for this order" },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(orderDoc.totalAmount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Order.findByIdAndUpdate(orderDoc._id, {
      $set: { razorpay_order_id: order.id },
    });

    return NextResponse.json({
      order_id: order.id,
      currency: order.currency,
      amount: order.amount,
      app_order_id: String(orderDoc._id),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
