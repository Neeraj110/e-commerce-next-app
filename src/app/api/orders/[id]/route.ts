import { NextResponse, NextRequest } from "next/server";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import mongoose from "mongoose";

interface IParams {
  id: string;
}

// DELETE order with stock restoration
export async function DELETE(
  req: NextRequest,
  { params }: { params: IParams }
) {
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

    const order = await Order.findOne({
      _id: params.id,
      user: authSession.user.id,
    })
      .session(session)
      .lean();

    if (!order) {
      await session.abortTransaction();
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
        const result = await Product.bulkWrite(stockUpdates, { session });

        if (!result.ok) {
          await session.abortTransaction();
          return NextResponse.json(
            { error: "Failed to restore product stock" },
            { status: 500 }
          );
        }
      }
    }

    await Order.findOneAndDelete({
      _id: params.id,
      user: authSession.user.id,
    }).session(session);

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Order deleted successfully",
        stockRestored: shouldRestoreStock,
      },
      { status: 200 }
    );
  } catch (error: any) {
    await session.abortTransaction();

    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// GET single order
export async function GET(req: NextRequest, { params }: { params: IParams }) {
  try {
    await connectDb();
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const order = await Order.findOne({
      _id: params.id,
      user: session.user.id,
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
export async function PATCH(req: NextRequest, { params }: { params: IParams }) {
  try {
    await connectDb();
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const order = await Order.findOneAndUpdate(
      { _id: params.id, user: session.user.id },
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
