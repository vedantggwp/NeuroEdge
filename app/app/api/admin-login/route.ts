import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { issueToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = checkRateLimit(`admin-login:${clientIp}`, 5, 900_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 15 minutes and try again." },
      { status: 429 },
    );
  }

  const form = await req.formData();
  const password = form.get("password")?.toString() ?? "";
  const correct = process.env.ADMIN_PASSWORD ?? "";

  if (!correct) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Timing-safe password comparison
  const passwordBuf = Buffer.from(password);
  const correctBuf = Buffer.from(correct);
  const match =
    passwordBuf.length === correctBuf.length &&
    timingSafeEqual(passwordBuf, correctBuf);

  if (!match) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set("neuroedge-admin", issueToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
