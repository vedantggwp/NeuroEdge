import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";

// Raw body is required for Stripe signature verification.
// Next.js App Router exposes req.text() without any additional config.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { scanId, couponCode } = (session.metadata as Record<string, string>) ?? {};

    if (!scanId) {
      console.error("Webhook: missing scanId in session metadata", session.id);
      return NextResponse.json({ received: true });
    }

    const db = createServerClient();

    const { data: report, error: insertError } = await db
      .from("reports")
      .insert({
        scan_id: scanId,
        email: session.customer_email,
        stripe_session_id: session.id,
        stripe_payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        coupon_code: couponCode || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !report) {
      console.error("Webhook: failed to insert report record:", insertError);
      // Return 200 anyway — Stripe will not retry on 5xx if we've already processed
      return NextResponse.json({ received: true });
    }

    const scanServiceUrl = process.env.SCAN_SERVICE_URL;
    if (scanServiceUrl) {
      await fetch(`${scanServiceUrl}/api/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, scanId }),
      }).catch((err: unknown) => {
        console.error("Webhook: failed to trigger report generation:", err);
      });
    }
  }

  return NextResponse.json({ received: true });
}
