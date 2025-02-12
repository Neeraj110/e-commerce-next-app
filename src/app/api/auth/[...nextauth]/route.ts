import authOptions from "@/lib/authOption";
import NextAuth from "next-auth";

// src/app/api/auth/[...nextauth]/route.ts
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
