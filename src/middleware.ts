import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes that don't need authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/products",
  "/product", // For single product pages
  "/categories",
  "/search",
  "/api/auth",
  "/api/products", // For product API routes
];

// Define admin-only routes
const adminRoutes = [
  "/admin-dashboard",
  "/api/admin",
];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
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

        // Check admin routes
        if (pathname.startsWith("/admin-dashboard")) {
          return token?.role === "admin";
        }

        // Protected dashboard routes requiring authentication
        const protectedDashboardRoutes = [
          "/all-orders",
          "/cart",
          "/order-confirmation",
          "/payment",
          "/user-profile",
        ];

        if (protectedDashboardRoutes.some((route) => pathname.includes(route))) {
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

// Matcher configuration
export const config = {
  matcher: [
    // Protected dashboard routes
    "/all-orders/:path*",
    "/cart/:path*",
    "/order-confirmation/:path*",
    "/payment/:path*",
    "/user-profile/:path*",

    // Admin dashboard
    "/admin-dashboard/:path*",

    // API routes (except public ones)
    "/api/:path*",

    // Exclude public routes and static files
    "/((?!products|product|api/products|api/categories|api/search|_next/static|_next/image|favicon.ico).*)",
  ],
};