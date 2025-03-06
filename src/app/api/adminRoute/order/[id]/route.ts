import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import Order from "@/models/order.model";
import { adminAuthMiddleware } from "@/utils/adminAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await adminAuthMiddleware(req);
    if (adminAuth) return adminAuth;

    const { id } = await params;
    await connectDb();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Successfully fetch order", order },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
