import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";

const validateAdminAccess = async (
  request: NextRequest,
  requireAdmin = true
) => {
  await connectDb();
  if (requireAdmin) {
    const adminCheck = await adminAuthMiddleware(request);
    if (adminCheck) return adminCheck;
  }
  return null;
};

export async function POST(request: NextRequest) {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    const validation = await validateAdminAccess(request, !!existingAdmin);
    if (validation) return validation;

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please fill in all fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const isPasswordMatch = await existingUser.comparePassword(password);
      if (!isPasswordMatch) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }

      if (existingUser.role === "admin") {
        return NextResponse.json(
          { message: "Admin user already exists" },
          { status: 400 }
        );
      }

      existingUser.role = "admin";
      await existingUser.save();

      return NextResponse.json(
        { message: "Admin user updated successfully", user: existingUser },
        { status: 200 }
      );
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    return NextResponse.json(
      { message: "Admin user created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating/updating admin:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const validation = await validateAdminAccess(request);
    if (validation) return validation;

    const user = await User.findOne({ email: session?.user.email })
      .select("-password")
      .lean();

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authError = await adminAuthMiddleware(request);
    if (authError) return authError;

    const user = await User.findOne({ email: session?.user?.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(user._id);

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authError = await adminAuthMiddleware(request);
    if (authError) return authError;

    const user = await User.findOne({ email: session?.user.email });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
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
