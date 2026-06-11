import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/client-ip";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

interface ValidateBody {
  couponCode?: string;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`coupon-validate:${clientIp}`, 20, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: ValidateBody;
  try {
    body = (await req.json()) as ValidateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { couponCode } = body;
  if (!couponCode || typeof couponCode !== "string") {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }

  const normalised = couponCode.toUpperCase().trim();
  const db = createServerClient();

  const { data: coupon } = await db
    .from("coupons")
    .select("discount_percent, max_uses, current_uses")
    .eq("code", normalised)
    .eq("active", true)
    .single();

  if (!coupon) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
  }

  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return NextResponse.json(
      { error: "Coupon has been fully redeemed" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    valid: true,
    discountPercent: coupon.discount_percent as number,
  });
}
