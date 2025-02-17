import { NextResponse, NextRequest } from "next/server";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import mongoose from "mongoose";

// POST /api/orders
export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDb();
    const authSession = await getServerSession({ req, ...authOptions });
    if (!authSession) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.items?.length || !body.shippingAddress || !body.paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const stockUpdates = [];
    let totalAmount = 0;

    for (const item of body.items) {
      const product = await Product.findById(item.product).session(session);

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

    await Product.bulkWrite(stockUpdates, { session });

    const order = await Order.create(
      [
        {
          ...body,
          user: authSession.user.id,
          totalAmount,
          status: "pending",
          paymentStatus: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json(order[0], { status: 201 });
  } catch (error: any) {
    await session.abortTransaction();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    session.endSession();
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await getServerSession({ req, ...authOptions });
    if (!session) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }
    const orders = await Order.find({ user: session.user.id });
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
