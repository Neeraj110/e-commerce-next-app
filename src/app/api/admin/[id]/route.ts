import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";
import { isValidObjectId } from "mongoose";
import { adminAuthMiddleware } from "@/utils/adminAuth";

interface RouteParams {
  params: { id: string };
}

const validateRequest = async (request: NextRequest, id: string) => {
  await connectDb();
  const adminCheck = await adminAuthMiddleware(request);
  if (adminCheck) return adminCheck;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }
  return null;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const validation = await validateRequest(request, params.id);
    if (validation) return validation;

    const body = await request.json();
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const validation = await validateRequest(request, params.id);
    if (validation) return validation;

    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const validation = await validateRequest(request, params.id);
    if (validation) return validation;

    const user = await User.findById(params.id).select("-password").lean();
    if (!user) {
      return;
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
