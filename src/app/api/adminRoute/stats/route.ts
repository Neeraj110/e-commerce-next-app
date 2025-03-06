import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import User from "@/models/user.model";
import { adminAuthMiddleware } from "@/utils/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const admin = await adminAuthMiddleware(req);

    if (admin) {
      return admin;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("_id email")
      .skip(skip)
      .limit(limit)
      .lean();

    const orders = await Order.find()
      .select("_id totalAmount")
      .skip(skip)
      .limit(limit)
      .lean();

    const [totalUsers, totalOrders, totalProducts, revenueResult] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Order.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
            },
          },
        ]),
      ]);

    const revenue =
      revenueResult.length > 0 ? Math.floor(revenueResult[0].totalRevenue) : 0;

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalProducts,
      revenue,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalUserPages: Math.ceil(totalUsers / limit),
      orders,
      users,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Stats error" }, { status: 500 });
  }
}
