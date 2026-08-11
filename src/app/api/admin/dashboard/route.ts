import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import User from "@/models/user.model";
import Product from "@/models/product.model";
import Order from "@/models/order.model";
import Review from "@/models/reviews.model";

// GET /api/admin/dashboard — main dashboard analytics
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsersCount,
      totalProductsCount,
      totalOrdersCount,
      revenueResult,
      pendingOrdersCount,
      todayOrdersCount,
      lowStockCount,
      totalReviewsCount,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Review.countDocuments(),
    ]);

    const totalRevenue =
      revenueResult.length > 0 && revenueResult[0].total
        ? parseFloat(Number(revenueResult[0].total).toFixed(2))
        : 0;

    return NextResponse.json(
      {
        message: "Dashboard data fetched successfully",
        dashboard: {
          total_users: totalUsersCount,
          total_products: totalProductsCount,
          total_orders: totalOrdersCount,
          total_revenue: totalRevenue,
          pending_orders: pendingOrdersCount,
          today_orders: todayOrdersCount,
          low_stock_products: lowStockCount,
          total_reviews: totalReviewsCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getDashboard Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
