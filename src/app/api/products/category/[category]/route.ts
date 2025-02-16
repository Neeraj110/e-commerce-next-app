import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products/category/{category}
export async function GET(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    await connectDb();

    const { category } = params; // URL se dynamic category milegi
    const products = await Product.find({ category });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
