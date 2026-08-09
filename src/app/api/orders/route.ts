import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: authSession.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.items?.length || !body.shippingAddress || !body.paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let totalAmount = 0;

    // Calculate the total using server-side product data.
    for (const item of body.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.title}` },
          { status: 400 }
        );
      }

      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      ...body,
      user: user._id,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await Order.find({ user: user._id }).populate(
      "items.product"
    );
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
