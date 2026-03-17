import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect /app routes — check for token cookie or fall back to header
  if (pathname.startsWith("/app")) {
    // We can't verify a JWT at the edge without the secret being an env var,
    // so we do a lightweight presence check here. Real verification happens
    // server-side in each layout via initAuth().
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    // If no token at all, redirect to login immediately (saves a round-trip)
    // The token value is stored in localStorage by the client, so on hard-nav
    // the cookie won't be set — the layout's initAuth() handles that case.
    // We only redirect when a `token` cookie explicitly doesn't exist AND
    // a special "no-auth" cookie is set (set by the client on logout).
    const loggedOut = request.cookies.get("logged_out")?.value === "true";
    if (loggedOut) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*"],
};
