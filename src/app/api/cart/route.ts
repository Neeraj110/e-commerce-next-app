import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import Cart from "@/models/card.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import Product from "@/models/product.model";
import { isValidObjectId } from "mongoose";
import User from "@/models/user.model";
import { setCache, getCache, invalidateCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const cacheKey = `cart_${user._id}`;
    const cachedCart = await getCache<any>(cacheKey);
    if (cachedCart) {
      return NextResponse.json(cachedCart);
    }

    const cart = await Cart.findOne({ user: user._id }).populate(
      "items.product"
    );

    if (!cart) {
      const emptyCartResponse = { cart: { items: [] }, message: "Cart is empty" };
      await setCache(cacheKey, emptyCartResponse);
      return NextResponse.json(emptyCartResponse, { status: 200 });
    }

    await setCache(cacheKey, { cart, message: "fetch all cart successfully" });

    return NextResponse.json(
      { cart, message: "fetch all cart successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || !isValidObjectId(productId)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDb();

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = await Cart.create({
        user: user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    const cacheKey = `cart_${user._id}`;
    await invalidateCache(cacheKey);

    await cart.populate("items.product", "title price images stock");
    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await req.json();

    const user = await User.findOne({ email: session.user.email });

    const cart = await Cart.findOne({ user: user?._id }).populate(
      "items.product"
    );
    if (!cart)
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });

    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );
    if (itemIndex === -1)
      return NextResponse.json(
        { message: "Item not found in cart" },
        { status: 404 }
      );

    const product = await Product.findById(productId);
    if (!product)
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );

    if (quantity > product.stock) {
      return NextResponse.json(
        { message: `Only ${product.stock} items in stock` },
        { status: 400 }
      );
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const cacheKey = `cart_${user?._id}`;
    await invalidateCache(cacheKey);

    return NextResponse.json(
      { cart, message: `Item quantity updated to ${quantity}` },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
