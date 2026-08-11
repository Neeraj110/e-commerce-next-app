import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Product from "@/models/product.model";

// GET /api/admin/products/low-stock — get products with low stock
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const threshold = parseInt(searchParams.get("threshold") || "5", 10);

    const products = await Product.find({ stock: { $lte: threshold } })
      .sort({ stock: 1 })
      .lean();

    const formattedProducts = products.map((p: any) => ({
      id: p._id,
      title: p.title,
      price: p.price,
      stock: p.stock,
      image: p.images && p.images.length > 0 ? p.images[0].url : null,
    }));

    return NextResponse.json(
      {
        message: "Low stock products fetched successfully",
        threshold,
        products: formattedProducts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getLowStockProducts Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
