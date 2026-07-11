import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";

export async function adminAuthMiddleware(req: NextRequest) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "only can Admin access this route" },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error("Admin middleware error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}
