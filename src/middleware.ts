// import { auth } from "@/auth"
// import { NextResponse } from "next/server"

// export default auth((req) => {
//   const isLoggedIn = !!req.auth
//   const pathname = req.nextUrl.pathname

//   // Public routes
//   const publicRoutes = ["/login"]

//   // Not logged in
//   if (!isLoggedIn && !publicRoutes.includes(pathname)) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }

//   // Already logged in and trying to visit login page
//   if (isLoggedIn && pathname === "/login") {
//     return NextResponse.redirect(new URL("/dashboard", req.url))
//   }

//   return NextResponse.next()
// })

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }


import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    publicRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  const accessToken =
    req.cookies.get("app-access-token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  try {
    await verifyAccessToken(accessToken);

    return NextResponse.next();
  } catch {
    // Access token invalid or expired
    const refreshUrl = new URL(
      "/api/auth/refresh",
      req.url
    );

    refreshUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(refreshUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/employees/:path*",
    "/settings/:path*",
  ],
};