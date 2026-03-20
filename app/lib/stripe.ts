import Stripe from "stripe";

/**
 * Lazy-initialised Stripe client (server-side only).
 * Deferred to avoid throwing at build time when env vars are absent.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

/** Convenience named export for callers that want a direct reference. */
export { getStripe as stripe };
