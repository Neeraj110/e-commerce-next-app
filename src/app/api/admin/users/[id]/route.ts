import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import User from "@/models/user.model";
import Order from "@/models/order.model";
import Review from "@/models/reviews.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import mongoose from "mongoose";

// GET /api/admin/users/:id — single user details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user: any = await User.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const [orders, reviews, orderStats] = await Promise.all([
      Order.find({ user: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id status paymentStatus totalAmount createdAt")
        .lean(),
      Review.find({ user: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("product", "title")
        .lean(),
      Order.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(id),
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total_orders: { $sum: 1 },
            total_spent: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    const formattedOrders = orders.map((o: any) => ({
      id: o._id,
      status: o.status,
      payment_status: o.paymentStatus,
      total_amount: o.totalAmount,
      created_at: o.createdAt,
    }));

    const formattedReviews = reviews.map((r: any) => ({
      id: r._id,
      product_id: r.product?._id || null,
      product_title: r.product?.title || "Deleted Product",
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt,
    }));

    const totalOrders = orderStats.length > 0 ? orderStats[0].total_orders : 0;
    const totalSpent =
      orderStats.length > 0 ? parseFloat(orderStats[0].total_spent.toFixed(2)) : 0;

    return NextResponse.json(
      {
        message: "User details fetched successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
          stats: {
            total_orders: totalOrders,
            total_spent: totalSpent,
          },
          addresses: user.addresses || [],
          recent_orders: formattedOrders,
          recent_reviews: formattedReviews,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getUserById Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/:id — delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const session = await getServerSession(authOptions);
    const currentUser = await User.findOne({ email: session?.user?.email });

    const { id } = await params;

    if (currentUser && currentUser._id.toString() === id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("deleteUser Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
