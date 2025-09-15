import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = [
  "/profile",
  "/my-rentals",
  "/rental-confirmation",
  "/return-bike",
  "/return-confirmation",
  "/bike-selection",
];

// Define admin routes
const adminRoutes = ["/admin"];

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/", "/bicycles"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  // For protected routes, we'll let the client-side AuthWrapper handle the protection
  // This middleware is mainly for additional security and SEO purposes

  // Allow all requests to pass through - client-side protection will handle the rest
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
