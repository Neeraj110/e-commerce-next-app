import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import Cart from "@/models/card.model";
import Product from "@/models/product.model";

interface RouteContext {
  params: {
    id: string;
  };
}

// 🛒 PATCH (Update Cart Item Quantity)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDb();
    const { productId, quantity } = await req.json();
    const { id } = context.params;

    const cart = await Cart.findById(id);
    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
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

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return NextResponse.json(
      {
        message: `Item quantity updated to ${quantity}`,
        cart,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🗑️ DELETE (Remove Item from Cart)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDb();
    const { productId } = await req.json();
    const { id } = context.params;

    const cart = await Cart.findById(id);
    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return NextResponse.json(
        { message: "Item not found in cart" },
        { status: 404 }
      );
    }

    await cart.save();

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
