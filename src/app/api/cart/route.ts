import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import Cart from "@/models/card.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";

// 🛒 GET Cart - Fetch user cart using session
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id; // NextAuth se UserId mil rahi hai

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json(
      { cart, message: "fetch all cart successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { productId, quantity } = await req.json();

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    return NextResponse.json(
      { cart, message: "cart add successfuly" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
