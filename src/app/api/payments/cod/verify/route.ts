import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";
import authOptions from "@/lib/authOption";
import { getServerSession } from "next-auth";
import connectDb from "@/config/connectDb";
import User from "@/models/user.model";

//src/app/api/payments/cod/verify/route.ts
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    await connectDb();
    const session = await getServerSession({ req, ...authOptions });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).select("role");
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, paymentMethod: "COD", codVerified: false },
      {
        $set: {
          codVerified: true,
          paymentStatus: "completed",
          paidAt: new Date(),
          status: "delivered",
        },
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "COD payment verified",
      order,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
