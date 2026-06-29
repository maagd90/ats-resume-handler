import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "passats_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/optimize",
  "/resume",
  "/linkedin",
  "/jobs",
  "/applications",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !request.cookies.get(AUTH_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/optimize/:path*", "/resume/:path*", "/linkedin/:path*", "/jobs/:path*", "/applications/:path*", "/settings/:path*"],
};
