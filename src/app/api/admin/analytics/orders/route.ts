import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Order from "@/models/order.model";

// GET /api/admin/analytics/orders — order status breakdown
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const [statusBreakdown, paymentBreakdown, recentOrders] = await Promise.all(
      [
        Order.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
        ]),
        Order.aggregate([
          { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
          { $project: { _id: 0, payment_status: "$_id", count: 1 } },
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("user", "name email")
          .lean(),
      ]
    );

    const formattedRecentOrders = recentOrders.map((order: any) => ({
      id: order._id,
      status: order.status,
      payment_status: order.paymentStatus,
      total_amount: order.totalAmount,
      created_at: order.createdAt,
      user_name: order.user?.name || "N/A",
      user_email: order.user?.email || "N/A",
    }));

    return NextResponse.json(
      {
        message: "Order analytics fetched successfully",
        analytics: {
          status_breakdown: statusBreakdown,
          payment_breakdown: paymentBreakdown,
          recent_orders: formattedRecentOrders,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getOrderAnalytics Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
