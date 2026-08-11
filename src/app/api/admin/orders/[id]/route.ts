import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import Order from "@/models/order.model";

// GET /api/admin/orders/:id — detailed order view for admin
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { id } = await params;

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("items.product", "title price images")
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const formattedItems = (order.items || []).map((item: any) => ({
      product_id: item.product?._id || item.product,
      title: item.product?.title || "Product",
      quantity: item.quantity,
      price: item.price,
      image:
        item.product?.images && item.product.images.length > 0
          ? item.product.images[0].url
          : null,
    }));

    const formattedOrder = {
      id: order._id,
      user_id: (order.user as any)?._id || null,
      user_name: (order.user as any)?.name || "N/A",
      user_email: (order.user as any)?.email || "N/A",
      status: order.status,
      payment_status: order.paymentStatus,
      payment_method: order.paymentMethod,
      total_amount: order.totalAmount,
      tracking_number: order.trackingNumber || null,
      shipping_address: order.shippingAddress,
      created_at: order.createdAt,
      paid_at: order.paidAt || null,
      items: formattedItems,
    };

    return NextResponse.json(
      {
        message: "Order details fetched successfully",
        order: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getAdminOrderById Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/:id — update status or paymentStatus
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { id } = await params;
    const { status, paymentStatus } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (status) {
      order.status = status;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === "completed" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    await order.save();

    return NextResponse.json(
      {
        message: "Order updated successfully",
        order: {
          id: order._id,
          status: order.status,
          payment_status: order.paymentStatus,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("updateOrder Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
