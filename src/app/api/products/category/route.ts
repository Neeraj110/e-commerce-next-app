import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { NextRequest, NextResponse } from "next/server";

// src/app/api/products/category/route.ts

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const category = await Product.distinct("categories");
    return NextResponse.json({ category }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
