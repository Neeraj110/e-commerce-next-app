import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import Cart from "@/models/card.model";
import Product from "@/models/product.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import { isValidObjectId } from "mongoose";
import User from "@/models/user.model";
import { invalidateCache } from "@/lib/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { productId, quantity } = await req.json();
    const { id } = await params;

    if (!productId || !quantity || !id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.find((item: any) => item._id.toString() === id);
    if (!item) {
      return NextResponse.json(
        { message: "Item not found in cart" },
        { status: 404 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { message: `Only ${product.stock} items in stock` },
        { status: 400 }
      );
    }

    // Update quantity
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "title price images stock");
    await invalidateCache(`cart_${user._id}`);

    return NextResponse.json(
      {
        cart,
        message: `Item quantity updated to ${quantity}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid cart item ID" },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    const initialLength = cart.items.length;

    // Fixed: Use string comparison instead of direct object comparison
    cart.items = cart.items.filter((item: any) => item._id.toString() !== id);

    if (cart.items.length === initialLength) {
      return NextResponse.json(
        { message: "Item not found in cart" },
        { status: 404 }
      );
    }

    await cart.save();
    await invalidateCache(`cart_${user._id}`);

    return NextResponse.json(
      {
        message: "Item removed from cart successfully",
        cart,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
