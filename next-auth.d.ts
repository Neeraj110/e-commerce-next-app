import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "user" | "admin";
      name: string | null;
    } & DefaultSession["user"];
  }
}

