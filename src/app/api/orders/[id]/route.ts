import { NextResponse, NextRequest } from "next/server";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import mongoose from "mongoose";
import User from "@/models/user.model";

// src/app/api/orders/[id]/route.ts
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    const authSession = await getServerSession({ req, ...authOptions });

    if (!authSession) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: authSession.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await Order.findOne({
      _id: id,
      user: user._id,
    }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const shouldRestoreStock = ["pending", "processing"].includes(order.status);

    if (shouldRestoreStock) {
      const stockUpdates = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } },
        },
      }));

      if (stockUpdates.length > 0) {
        const result = await Product.bulkWrite(stockUpdates);

        if (!result.ok) {
          return NextResponse.json(
            { error: "Failed to restore product stock" },
            { status: 500 }
          );
        }
      }
    }

    await Order.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    return NextResponse.json(
      {
        message: "Order deleted successfully",
        stockRestored: shouldRestoreStock,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET single order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const session = await getServerSession({ req, ...authOptions });
    const { id } = await params;
    if (!session) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await Order.findOne({
      _id: id,
      user: user?._id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Successfully fetch order", order },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE order
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const session = await getServerSession({ req, ...authOptions });
    const { id } = await params;
    if (!session) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const order = await Order.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Order updated successfully", order },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
