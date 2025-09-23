import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const PUBLIC_PATHS = ["/auth/login", "/auth/signup", "/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/teams/:path*", "/contracts/:path*"],
};
