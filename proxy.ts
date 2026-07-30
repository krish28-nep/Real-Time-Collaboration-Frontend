import { NextRequest, NextResponse } from "next/server";

const tokenKey = "accessToken";
const authRoutes = new Set(["/login", "/register"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(tokenKey)?.value;

  if (!token && !authRoutes.has(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && authRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/workspaces/:path*", "/invitations/:path*", "/login", "/register"],
};
