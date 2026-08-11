import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Order from "@/models/order.model";

// GET /api/admin/analytics/revenue — revenue analytics (daily, weekly, monthly)
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly";

    let dateFormat = "%Y-%m";
    let limit = 12;
    const startDate = new Date();

    if (period === "daily") {
      dateFormat = "%Y-%m-%d";
      limit = 30;
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === "weekly") {
      dateFormat = "%G-W%V";
      limit = 12;
      startDate.setDate(startDate.getDate() - 7 * 12);
    } else {
      dateFormat = "%Y-%m";
      limit = 12;
      startDate.setMonth(startDate.getMonth() - 12);
    }

    const revenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          order_count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
          paid_revenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          period: "$_id",
          order_count: 1,
          revenue: 1,
          paid_revenue: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        message: "Revenue analytics fetched successfully",
        period,
        analytics: revenue,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getRevenueAnalytics Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
