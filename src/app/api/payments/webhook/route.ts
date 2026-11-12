/**
 * src/app/api/payments/webhook/route.ts
 *
 * Razorpay webhook endpoint — receives server-to-server payment events so
 * orders are fulfilled even when the user's browser tab closes after payment.
 *
 * Setup:
 *  1. In the Razorpay dashboard → Webhooks, add your URL:
 *       https://your-domain.com/api/payments/webhook
 *  2. Select the "payment.captured" event.
 *  3. Set a Webhook Secret and add it to your .env.local as RAZORPAY_WEBHOOK_SECRET.
 *
 * Security: Every request is verified with the X-Razorpay-Signature HMAC before
 * any database write occurs.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import connectDb from "@/config/connectDb";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import Cart from "@/models/card.model";
import { invalidateCache } from "@/lib/cache";

// Razorpay sends the raw body for signature verification — we must NOT parse it
// with req.json() before verifying.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ── 1. Read raw body ───────────────────────────────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // ── 2. Verify HMAC signature ───────────────────────────────────────────────
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.warn("Razorpay webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── 3. Parse event ─────────────────────────────────────────────────────────
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only handle payment.captured — ignore all other events gracefully
  if (event?.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const razorpay_payment_id: string = event.payload?.payment?.entity?.id;
  const razorpay_order_id: string =
    event.payload?.payment?.entity?.order_id;

  if (!razorpay_payment_id || !razorpay_order_id) {
    return NextResponse.json(
      { error: "Missing payment details in webhook payload" },
      { status: 400 }
    );
  }

  // ── 4. Fulfil the order inside a Mongoose transaction ─────────────────────
  try {
    await connectDb();

    // Find the matching pending order
    const existingOrder = await Order.findOne({
      razorpay_order_id,
      paymentStatus: "pending",
    });

    if (!existingOrder) {
      // Could be a duplicate webhook for an already-completed order — that's OK
      return NextResponse.json({ received: true });
    }

    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        // Deduct stock concurrently
        const stockUpdates = existingOrder.items.map((item: any) =>
          Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true, session: dbSession }
          )
        );

        const results = await Promise.all(stockUpdates);
        const outOfStock = results.some((r) => r === null);

        if (outOfStock) {
          // Cancel the order if we can't fulfil it
          await Order.findByIdAndUpdate(
            existingOrder._id,
            {
              $set: {
                paymentStatus: "completed",
                status: "cancelled",
                razorpay_payment_id,
                paidAt: new Date(),
              },
            },
            { session: dbSession }
          );
          console.error(
            `Order ${existingOrder._id} cancelled — out of stock during webhook fulfilment`
          );
          return;
        }

        const trackingNumber = `TRK${Math.floor(Math.random() * 1_000_000)}`;

        await Order.findByIdAndUpdate(
          existingOrder._id,
          {
            $set: {
              paymentStatus: "completed",
              status: "processing",
              razorpay_payment_id,
              trackingNumber,
              paidAt: new Date(),
            },
          },
          { session: dbSession }
        );
      });
    } finally {
      await dbSession.endSession();
    }

    // Clear cart cache for the order's user (best-effort, non-fatal)
    try {
      await Cart.findOneAndDelete({ user: existingOrder.user });
      await invalidateCache(`cart_${existingOrder.user}`);
    } catch (cartErr) {
      console.error("Cart cleanup failed in webhook:", cartErr);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook fulfilment error:", err);
    // Return 200 to prevent Razorpay from retrying — log and handle manually
    return NextResponse.json({ received: true, error: err.message });
  }
}

