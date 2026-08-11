import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Review from "@/models/reviews.model";
import Product from "@/models/product.model";

// DELETE /api/admin/reviews/:id — admin delete any review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(id);

    // Recalculate product rating
    const ratingStats = await Review.aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: null,
          avg_rating: { $avg: "$rating" },
          total_count: { $sum: 1 },
        },
      },
    ]);

    const avgRating =
      ratingStats.length > 0 && ratingStats[0].avg_rating
        ? parseFloat(Number(ratingStats[0].avg_rating).toFixed(1))
        : 0;
    const totalCount = ratingStats.length > 0 ? ratingStats[0].total_count : 0;

    await Product.findByIdAndUpdate(productId, {
      "rating.rate": avgRating,
      "rating.count": totalCount,
    });

    return NextResponse.json(
      { message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("adminDeleteReview Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
