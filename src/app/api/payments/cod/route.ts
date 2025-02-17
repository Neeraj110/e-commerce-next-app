// app/api/payment/cod/route.ts
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authSession = await getServerSession({ req, ...authOptions });
    if (!authSession) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items, shippingAddress, orderId } = body;

    // Validate required fields
    if (!items?.length || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify stock availability and calculate total
    let totalAmount = 0;
    const stockUpdates = [];

    for (const item of items) {
      const product = await Product.findById(item.product)
        .session(session)
        .lean();

      if (!product) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Product not found: ${item.product}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.title}` },
          { status: 400 }
        );
      }

      totalAmount += product.price * item.quantity;

      stockUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    // Update product stock
    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, { session });
    }

    // Create or update order
    const orderData = {
      user: authSession.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: "COD",
      paymentStatus: "pending",
      status: "processing",
      cod: true,
      codVerified: false,
    };

    let order;
    if (orderId) {
      order = await Order.findOneAndUpdate(
        { _id: orderId, user: authSession.user.id },
        orderData,
        { new: true, session }
      );
    } else {
      order = await Order.create([orderData], { session });
      order = order[0];
    }

    if (!order) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Failed to create/update order" },
        { status: 500 }
      );
    }

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "COD order placed successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await session.abortTransaction();

    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    session.endSession();
  }
}
