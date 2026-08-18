import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Skip API routes and static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Example subdomain-based tenant resolution
  const subdomain = hostname.split(".")[0];
  const validSubdomains = ["app", "demo", "tenant1", "tenant2"];

  if (validSubdomains.includes(subdomain)) {
    // Rewrite to /tenant/[subdomain] – you can implement a dynamic route later
    return NextResponse.rewrite(
      new URL(`/tenant/${subdomain}${pathname}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};
