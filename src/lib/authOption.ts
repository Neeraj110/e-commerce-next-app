import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectDb();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (!user.password) {
            throw new Error(
              "Please use Google/GitHub login or set a password first"
            );
          }

          const isValidPassword = await user.comparePassword(
            credentials.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          throw new Error(
            error instanceof Error ? error.message : "Unknown error occurred"
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      try {
        await connectDb();

        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            return true;
          }

          // Create new OAuth user without password
          await User.create({
            email: user.email,
            name: user.name,
            password: "1254",
          });
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
