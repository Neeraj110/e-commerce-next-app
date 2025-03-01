// import { NextRequest, NextResponse } from "next/server";
// import User from "@/models/user.model";
// import connectDb from "@/config/connectDb";
// import { adminAuthMiddleware } from "@/utils/adminAuth";

// export async function POST(request: NextRequest) {
//   try {
//     await connectDb();

//     const existingAdmin = await User.findOne({ role: "admin" });
//     if (existingAdmin) {
//       const adminCheck = await adminAuthMiddleware(request);
//       if (adminCheck) return adminCheck;
//     }

//     const { name, email, password } = await request.json();

//     if (!name || !email || !password) {
//       return NextResponse.json(
//         { error: "Name, email, and password are required" },
//         { status: 400 }
//       );
//     }

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       const isPasswordMatch = await existingUser.comparePassword(password);
//       if (!isPasswordMatch) {
//         return NextResponse.json(
//           { error: "Incorrect password. Cannot upgrade user to admin." },
//           { status: 401 }
//         );
//       }

//       if (existingUser.role === "admin") {
//         return NextResponse.json(
//           { error: "This user is already an admin." },
//           { status: 400 }
//         );
//       }

//       existingUser.role = "admin";
//       await existingUser.save();

//       return NextResponse.json(
//         { message: "User role updated to admin.", user: existingUser },
//         { status: 200 }
//       );
//     }

//     const newUser = await User.create({
//       name,
//       email,
//       password,
//       role: "admin",
//     });

//     return NextResponse.json(
//       { message: "Admin user created successfully.", user: newUser },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("Error creating/updating admin:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // Get All Users
// export async function GET(request: NextRequest) {
//   try {
//     await connectDb();

//     const adminCheck = await adminAuthMiddleware(request);
//     if (adminCheck) return adminCheck;

//     const users = await User.find().select("-password").lean();

//     return NextResponse.json(users, { status: 200 });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
