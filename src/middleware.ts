import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rate limit auth endpoints
    if (path.startsWith("/api/auth") && req.method === "POST") {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { allowed, resetIn } = checkRateLimit(`auth:${ip}`, 10, 60000);
      if (!allowed) {
        return NextResponse.json(
          { error: "Demasiados intentos. Intente de nuevo más tarde." },
          { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } }
        );
      }
    }

    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
