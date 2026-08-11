import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Product from "@/models/product.model";

// PUT /api/admin/products/:id/stock — update product stock
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { id } = await params;
    const { stock } = await req.json();

    if (stock === undefined || stock === null || Number(stock) < 0) {
      return resStatus(400, "Valid stock value (>= 0) is required");
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    product.stock = Number(stock);
    await product.save();

    return NextResponse.json(
      {
        message: `Product stock updated to ${stock}`,
        product: {
          id: product._id,
          title: product.title,
          stock: product.stock,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("updateProductStock Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function resStatus(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}
