import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Order from "@/models/order.model";

// GET /api/admin/analytics/top-products — top selling products
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          total_sold: { $sum: "$items.quantity" },
          total_revenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { total_sold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          id: "$product._id",
          title: "$product.title",
          price: "$product.price",
          stock: "$product.stock",
          rating_rate: "$product.rating.rate",
          rating_count: "$product.rating.count",
          total_sold: 1,
          total_revenue: 1,
          image: { $arrayElemAt: ["$product.images.url", 0] },
        },
      },
    ]);

    return NextResponse.json(
      {
        message: "Top products fetched successfully",
        products: topProducts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getTopProducts Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
