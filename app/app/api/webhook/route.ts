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

    // Idempotency guard. Stripe delivers webhooks at-least-once, so the same
    // `checkout.session.completed` can arrive multiple times. We must insert the
    // report and increment the coupon EXACTLY once per Stripe session.
    //
    // Two layers, robust across deployment states:
    //   1. Pre-insert lookup — works even where migration 004 (the UNIQUE
    //      constraint) has not been applied yet (self-hosters / not-yet-migrated).
    //   2. Unique-violation (Postgres 23505) handling on insert — closes the
    //      concurrent-retry race once the constraint exists, since two
    //      simultaneous retries can both pass the lookup before either inserts.
    const { data: existing, error: lookupError } = await db
      .from("reports")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (lookupError) {
      console.error("Webhook: failed to look up existing report:", lookupError);
      // Don't insert on an ambiguous read — a transient read failure must not
      // cause a duplicate insert + double coupon increment. Stripe will retry.
      return NextResponse.json(
        { error: "Failed to verify report state" },
        { status: 500 },
      );
    }

    if (existing) {
      // Already processed this Stripe session — no insert, no increment.
      return NextResponse.json({ received: true });
    }

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
      // Unique violation = a concurrent retry won the race and already inserted
      // this session. Treat as already-processed: no increment, no regeneration.
      if (insertError?.code === "23505") {
        return NextResponse.json({ received: true });
      }
      console.error("Webhook: failed to insert report record:", insertError);
      // Genuine insert failure (NOT a 23505 idempotency hit) — return 500 so
      // Stripe retries delivery. The pre-insert lookup + the 23505 guard above
      // make retries safe (no duplicate report, no double coupon increment), so
      // a 200 here would silently drop a *paid* report with no recovery.
      return NextResponse.json(
        { error: "Failed to persist report" },
        { status: 500 },
      );
    }

    // Confirmed brand-new insert — increment coupon usage exactly once.
    if (couponCode && typeof couponCode === "string" && couponCode.length > 0) {
      const { error: rpcError } = await db.rpc("increment_coupon_usage", {
        coupon_code: couponCode,
      });
      if (rpcError) {
        console.error("Webhook: failed to increment coupon usage:", rpcError);
      }
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
        console.error("Webhook: failed to trigger report generation:", err);
      });
    }
  }

  return NextResponse.json({ received: true });
}
