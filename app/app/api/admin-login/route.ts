import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = form.get("password")?.toString() ?? "";
  const correct = process.env.ADMIN_PASSWORD ?? "";

  if (!correct || password !== correct) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set("neuroedge-admin", correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
