import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import User from "@/models/user.model";

// GET /api/admin/users — get all users with pagination & search
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const authError = await adminAuthMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("id name email role createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
    ]);

    const formattedUsers = users.map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.createdAt,
    }));

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("getAllUsers Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
