import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow cron (called by GitHub Actions with CRON_SECRET)
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = request.cookies.get("session")?.value;
  if (session !== process.env.SESSION_SECRET) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
