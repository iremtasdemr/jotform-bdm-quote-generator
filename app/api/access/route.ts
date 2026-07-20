import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  accessToken,
  configuredAccessPassword,
  isValidAccessPassword,
} from "../../access-auth";

const accessDurationSeconds = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (!configuredAccessPassword()) {
    return redirectToAccess(request, "missing");
  }

  if (!isValidAccessPassword(password)) {
    return redirectToAccess(request, "invalid");
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.set(accessCookieName, accessToken(), {
    httpOnly: true,
    maxAge: accessDurationSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function redirectToAccess(request: NextRequest, error: string) {
  const url = new URL("/access", request.url);
  url.searchParams.set("error", error);

  return NextResponse.redirect(url, 303);
}
