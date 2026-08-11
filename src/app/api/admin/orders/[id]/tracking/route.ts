import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Order from "@/models/order.model";

// PUT /api/admin/orders/:id/tracking — update tracking number
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { id } = await params;
    const { tracking_number } = await req.json();

    if (!tracking_number || typeof tracking_number !== "string") {
      return NextResponse.json(
        { message: "Tracking number is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    order.trackingNumber = tracking_number.trim();
    await order.save();

    return NextResponse.json(
      {
        message: "Tracking number updated successfully",
        order: {
          id: order._id,
          tracking_number: order.trackingNumber,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("updateTrackingNumber Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
