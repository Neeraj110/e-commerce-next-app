import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";


// GET /api/user
export async function GET(req: NextRequest) {
  await connectDb();
  const users = await User.find({});
  return NextResponse.json(users);
}


