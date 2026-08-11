import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Review from "@/models/reviews.model";

// GET /api/admin/reviews — get all reviews (paginated)
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      Review.countDocuments(),
      Review.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate("user", "name email")
        .populate("product", "title")
        .lean(),
    ]);

    const formattedReviews = reviews.map((r: any) => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt,
      user_name: r.user?.name || "Deleted User",
      user_email: r.user?.email || "N/A",
      product_id: r.product?._id || null,
      product_title: r.product?.title || "Deleted Product",
    }));

    return NextResponse.json(
      {
        message: "Reviews fetched successfully",
        reviews: formattedReviews,
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
    console.error("getAllReviews Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
