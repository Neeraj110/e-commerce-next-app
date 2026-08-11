import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Order from "@/models/order.model";

// GET /api/admin/orders — all orders with filters & pagination
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");

    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate("user", "name email")
        .lean(),
    ]);

    const formattedOrders = orders.map((o: any) => ({
      id: o._id,
      user_id: o.user?._id || null,
      user_name: o.user?.name || "Deleted User",
      user_email: o.user?.email || "N/A",
      status: o.status,
      payment_status: o.paymentStatus,
      payment_method: o.paymentMethod,
      total_amount: o.totalAmount,
      tracking_number: o.trackingNumber || null,
      created_at: o.createdAt,
    }));

    return NextResponse.json(
      {
        message: "Orders fetched successfully",
        orders: formattedOrders,
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
    console.error("getAdminOrders Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
