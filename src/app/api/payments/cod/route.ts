// app/api/payment/cod/route.ts
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";
import Product from "@/models/product.model";
import Cart from "@/models/card.model";
import { invalidateCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const authSession = await getServerSession(authOptions);
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

    const body = await req.json();
    const { items, shippingAddress } = body;

    if (!items?.length || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    const stockUpdates = [];

    for (const item of items) {
      const product = await Product.findById(item.product).lean();

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for product: ${product.title} , ${product.stock}`,
          },
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

    const trackingNumber = `TRK${Math.floor(Math.random() * 1000000)}`;
    const orderData = {
      user: user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: "COD",
      paymentStatus: "pending",
      status: "shipped",
      codVerified: false,
      trackingNumber,
    };

    // Create the order
    const order = await Order.create(orderData);

    if (!order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Update stock only if order creation succeeds
    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates);
    }

    // Clear cart in DB & invalidate Redis cache
    await Cart.findOneAndDelete({ user: user._id });
    await invalidateCache(`cart_${user._id}`);

    return NextResponse.json(
      {
        message: "COD order placed successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
