import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit: 5 registration attempts per 15 minutes per IP ──────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anonymous";
    const rl = await rateLimit(ip, "auth_register", 5, 15 * 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetAt - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    const rawBody = await request.json();

    // Validate with Zod (enforces min lengths, email format, strong password)
    const parsed = registerSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDb();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with that email" },
        { status: 400 }
      );
    }

    await User.create({ email, password, name });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
