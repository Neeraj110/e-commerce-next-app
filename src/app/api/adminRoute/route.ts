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
    const session = await getServerSession(authOptions);
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      const validation = await validateAdminAccess(request);
      if (validation) return validation;

      const { name, email, password } = await request.json();

      if (!name || !email || !password) {
        return NextResponse.json(
          { message: "Please fill in all fields" },
          { status: 400 }
        );
      }

      const duplicateUser = await User.findOne({ email });
      if (duplicateUser) {
        return NextResponse.json(
          { message: "Email already in use by another user" },
          { status: 400 }
        );
      }

      const newAdmin = await User.create({
        name,
        email,
        password,
        role: "admin",
      });

      return NextResponse.json(
        { message: "Admin user created successfully", user: newAdmin },
        { status: 201 }
      );
    }

    const { name, email, password } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Login is required to bootstrap the first admin" },
        { status: 401 }
      );
    }

    if (session.user.email !== email) {
      return NextResponse.json(
        { message: "First admin email must match the logged in user" },
        { status: 400 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please fill in all fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    let newAdmin;
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.role = "admin";
      await existingUser.save();
      newAdmin = existingUser;
    } else {
      newAdmin = await User.create({
        name,
        email,
        password,
        role: "admin",
      });
    }

    return NextResponse.json(
      { message: "Admin user created successfully", user: newAdmin },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating admin:", error);
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
