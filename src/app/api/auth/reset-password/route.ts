import { NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import User from "@/models/user.model";

export async function PUT(req: Request) {
  try {
    await connectDb();
    const { email, password } = await req.json();
    console.log(email, password);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found or signup" },
        { status: 404 }
      );
    }

    user.password = password;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
