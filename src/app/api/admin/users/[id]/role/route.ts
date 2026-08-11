import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";

// PUT /api/admin/users/:id/role — update user role
export async function PUT(
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
    const { role } = await req.json();

    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { message: "Valid role ('user' or 'admin') is required" },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own role
    if (currentUser && currentUser._id.toString() === id) {
      return NextResponse.json(
        { message: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Enforce at most one admin exists in the system
    if (role === "admin") {
      const existingAdmin = await User.findOne({
        role: "admin",
        _id: { $ne: id },
      });
      if (existingAdmin) {
        return NextResponse.json(
          {
            message:
              "Another admin already exists in the system. Only one admin is allowed to exist. Demote the other admin first.",
          },
          { status: 400 }
        );
      }
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    return NextResponse.json(
      {
        message: `User role updated to "${role}"`,
        user: {
          id: userToUpdate._id,
          name: userToUpdate.name,
          email: userToUpdate.email,
          role: userToUpdate.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("updateUserRole Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
