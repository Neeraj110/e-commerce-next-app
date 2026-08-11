import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Product from "@/models/product.model";
import Order from "@/models/order.model";

// GET /api/admin/products — admin product listing with stock & sales info
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const allowedSorts: Record<string, string> = {
      created_at: "createdAt",
      createdAt: "createdAt",
      price: "price",
      stock: "stock",
      rating_rate: "rating.rate",
      title: "title",
    };
    const sortField = allowedSorts[sortBy] || "createdAt";

    const filter: any = {};
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ [sortField]: order })
      .skip(offset)
      .limit(limit)
      .lean();

    // Fetch aggregate sales data per product
    const productIds = products.map((p) => p._id);
    const salesData = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.product": { $in: productIds } } },
      {
        $group: {
          _id: "$items.product",
          total_sold: { $sum: "$items.quantity" },
          total_revenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
    ]);

    const salesMap = new Map();
    salesData.forEach((s) => {
      salesMap.set(s._id.toString(), {
        total_sold: s.total_sold,
        total_revenue: parseFloat(Number(s.total_revenue).toFixed(2)),
      });
    });

    const formattedProducts = products.map((p: any) => {
      const sales = salesMap.get(p._id.toString()) || {
        total_sold: 0,
        total_revenue: 0,
      };
      return {
        id: p._id,
        title: p.title,
        price: p.price,
        stock: p.stock,
        rating_rate: p.rating?.rate || 0,
        rating_count: p.rating?.count || 0,
        created_at: p.createdAt,
        total_sold: sales.total_sold,
        total_revenue: sales.total_revenue,
        image: p.images && p.images.length > 0 ? p.images[0].url : null,
        category: p.categories && p.categories.length > 0 ? p.categories[0] : "General",
      };
    });

    return NextResponse.json(
      {
        message: "Admin products fetched successfully",
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getAdminProducts Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
