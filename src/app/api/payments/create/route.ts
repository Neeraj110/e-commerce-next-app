// src/app/api/payments/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";

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
    const session = await getServerSession({ req, ...authOptions });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount } = body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing amount" },
        { status: 400 }
      );
    }
    const amountInPaise = Math.round(Number(amount) * 100);
    if (!Number.isInteger(amountInPaise)) {
      return NextResponse.json(
        { error: "Amount must result in an integer value in paise" },
        { status: 400 }
      );
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
