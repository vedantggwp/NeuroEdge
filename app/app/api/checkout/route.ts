import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";

const UNIT_AMOUNT_GBP = 2900; // £29.00 in pence

interface CheckoutRequestBody {
  scanId?: string;
  email?: string;
  couponCode?: string;
}

export async function POST(req: NextRequest) {
  let body: CheckoutRequestBody;
  try {
    body = (await req.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { scanId, email, couponCode } = body;

  if (!scanId || typeof scanId !== "string") {
    return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Validate coupon if provided
  let discountPercent = 0;
  let validatedCouponCode: string | null = null;

  if (couponCode && typeof couponCode === "string") {
    const normalised = couponCode.toUpperCase().trim();
    const db = createServerClient();
    const { data: coupon } = await db
      .from("coupons")
      .select("*")
      .eq("code", normalised)
      .eq("active", true)
      .single();

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 },
      );
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json(
        { error: "Coupon has been fully redeemed" },
        { status: 400 },
      );
    }

    discountPercent = coupon.discount_percent as number;
    validatedCouponCode = normalised;
  }

  // 100% discount: skip Stripe, create report directly
  if (discountPercent === 100 && validatedCouponCode) {
    const db = createServerClient();

    await db.rpc("increment_coupon_usage", {
      coupon_code: validatedCouponCode,
    });

    const { data: report, error: insertError } = await db
      .from("reports")
      .insert({
        scan_id: scanId,
        email,
        coupon_code: validatedCouponCode,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !report) {
      console.error("Failed to insert free report:", insertError);
      return NextResponse.json(
        { error: "Failed to create report record" },
        { status: 500 },
      );
    }

    const scanServiceUrl = process.env.SCAN_SERVICE_URL;
    if (scanServiceUrl) {
      await fetch(`${scanServiceUrl}/api/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.SCAN_SERVICE_API_KEY ?? "",
        },
        body: JSON.stringify({ reportId: report.id, scanId }),
      }).catch((err: unknown) => {
        console.error("Failed to trigger report generation:", err);
      });
    }

    return NextResponse.json({ reportId: report.id, free: true });
  }

  // Paid checkout via Stripe
  const finalAmount = Math.round(UNIT_AMOUNT_GBP * (1 - discountPercent / 100));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const stripe = getStripe();
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "NeuroEdge Full Accessibility Report",
              description:
                "Plain-English report with every issue, fix priorities, and revenue impact",
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/report/${scanId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/scan/${scanId}`,
      metadata: {
        scanId,
        couponCode: validatedCouponCode ?? "",
      },
    });
  } catch (err: unknown) {
    console.error("Stripe session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
