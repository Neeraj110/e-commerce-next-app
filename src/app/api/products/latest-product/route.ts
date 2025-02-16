import { NextResponse, NextRequest } from "next/server";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const latestProduct = await Product.findOne()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!latestProduct) {
      return NextResponse.json(
        { message: "No products found" },
        { status: 404 }
      );
    }

    return NextResponse.json(latestProduct, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching latest product:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
