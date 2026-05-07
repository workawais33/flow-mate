import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // ✅ Public routes (no auth required)
  const publicRoutes = ["/login", "/pricing", "/payment-success", "/api/stripe/checkout", "/api/verify-payment", "/api/stripe/webhook"];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ❌ No token - redirect to login
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // ✅ Check if user has paid access (from JWT token)
    const hasAccess = payload.hasAccess === true;
    const protectedRoutes = ["/dashboard", "/tasks", "/habits", "/profile"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    // ✅ If trying to access protected routes without payment, redirect to pricing
    if (isProtectedRoute && !hasAccess) {
      const url = new URL("/pricing", req.url);
      url.searchParams.set("message", "Please subscribe to access this page");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
    
  } catch (err) {
    console.error("Middleware error:", err.message);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/habits/:path*", "/profile/:path*"],
};