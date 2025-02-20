import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";
import { isValidObjectId } from "mongoose";
import { adminAuthMiddleware } from "@/utils/adminAuth";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDb();

    const adminCheck = await adminAuthMiddleware(request);
    if (adminCheck) return adminCheck;

    const { id } = context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connectDb();
    const adminCheck = await adminAuthMiddleware(request);
    if (adminCheck) return adminCheck;

    const { id } = context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await User.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDb();

    const adminCheck = await adminAuthMiddleware(request);
    if (adminCheck) return adminCheck;

    const { id } = context.params;

    const users = await User.findById(id).select("-password").lean();

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
