import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Order from "@/models/order.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    if (!session) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id, // MongoDB order ID
    } = body;

    // First verify the payment signature
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

    // Find the order first to verify it exists and belongs to the user
    const existingOrder = await Order.findOne({
      _id: order_id,
      user: session.user.id,
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if payment was already processed
    if (existingOrder.paymentStatus === "completed") {
      return NextResponse.json(
        { error: "Payment already processed" },
        { status: 400 }
      );
    }

    // Update the order with payment details
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order_id,
        user: session.user.id,
        paymentStatus: { $ne: "completed" }, // Extra check to prevent double processing
      },
      {
        $set: {
          paymentStatus: "completed",
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
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
