import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";
import { orderSchema } from "@/lib/validations";

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

    const rawBody = await req.json();

    // Validate & parse with Zod — rejects unknown fields automatically
    const parsed = orderSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Explicitly destructure only trusted fields — prevents mass-assignment
    const { items, shippingAddress, paymentMethod } = parsed.data;

    // Validate required fields
    if (!items?.length || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let totalAmount = 0;

    // Calculate the total using server-side product data.
    for (const item of items) {
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
      items,
      shippingAddress,
      paymentMethod,
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
