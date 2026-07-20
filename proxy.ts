import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  isAccessProtectionEnabled,
  isValidAccessToken,
} from "./app/access-auth";

const publicAssetPattern = /\.(?:avif|gif|ico|jpg|jpeg|png|svg|txt|webp)$/i;

export function proxy(request: NextRequest) {
  if (!isAccessProtectionEnabled()) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (
    pathname === "/access" ||
    pathname === "/api/access" ||
    pathname.startsWith("/_next/") ||
    publicAssetPattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(accessCookieName)?.value;

  if (isValidAccessToken(token)) return NextResponse.next();

  const accessUrl = request.nextUrl.clone();
  accessUrl.pathname = "/access";
  accessUrl.search = "";

  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
