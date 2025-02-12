import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes that don't need authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/products",
  "/categories",
  "/search",
  "/api/auth",
];

// Define admin-only routes
const adminRoutes = [
  "/admin",
  "/admin/products",
  "/admin/orders",
  "/admin/users",
  "/admin/settings",
];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow all public routes
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Check admin routes
        if (pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }

        // Protected routes requiring authentication
        const protectedRoutes = [
          "/dashboard",
          "/profile",
          "/orders",
          "/cart",
          "/checkout",
          "/wishlist",
          "/settings",
        ];

        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
          return !!token;
        }

        // API routes protection
        if (pathname.startsWith("/api")) {
          const publicApiRoutes = [
            "/api/products",
            "/api/categories",
            "/api/search",
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

// Matcher configuration for optimized performance
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
    "/settings/:path*",

    // Admin routes
    "/admin/:path*",

    // API routes (except public ones)
    "/api/:path*",

    // Exclude public API routes and static files
    "/((?!api/products|api/categories|api/search|_next/static|_next/image|favicon.ico).*)",
  ],
};
