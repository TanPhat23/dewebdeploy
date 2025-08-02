import { NextRequest, NextResponse } from "next/server";
import auth from "next-auth/middleware";

const protectedRoutes = ["/protected", "/dashboard", "/api/protected"];

export default function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If it's a protected route, use NextAuth middleware for authentication
  if (isProtectedRoute) {
    return auth(request);
  }

  // For non-protected routes, continue without authentication
  return NextResponse.next();
}

// Optionally, export config to match only specific routes
export const config = {
  matcher: ["/protected/:path*", "/dashboard/:path*", "/api/protected/:path*"],
};
