import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";
import authOptions from "@/lib/authOption";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const session = await getServerSession({ req, ...authOptions });

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, cod: true },
      {
        $set: {
          codVerified: true,
          paymentStatus: "completed",
          paidAt: new Date(),
          status: "processing",
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
