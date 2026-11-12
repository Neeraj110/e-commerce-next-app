import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes that don't need authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/product",
  "/api/auth",
  "/api/products",
  "/api/chatbot",   
];

// Define admin-only routes
const adminRoutes = [
  "/admin",
  "/api/admin",
];

export default withAuth(
  function proxy(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Block non-admins from admin pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token?.role !== "admin") {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Protected user-facing routes requiring authentication
        const protectedRoutes = [
          "/orders",
          "/checkout",
          "/profile",
          "/cart",
        ];

        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
          return !!token;
        }

        // Admin routes — role check happens in the middleware function above
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return !!token;
        }

        // All other /api/* routes require auth
        if (pathname.startsWith("/api")) {
          const publicApiRoutes = [
            "/api/products",
            "/api/auth",
            "/api/chatbot",
          ];
          if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
            return true;
          }
          return !!token;
        }

        return true;
      },
    },
  }
);

// Matcher configuration — aligned with real App Router paths
export const config = {
  matcher: [
    // Protected user dashboard routes
    "/orders/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/cart/:path*",

    // Admin dashboard and sub-routes
    "/admin/:path*",

    // All API routes
    "/api/:path*",

    // Catch-all, excluding static assets and public product pages
    "/((?!product|_next/static|_next/image|favicon.ico).*)",
  ],
};