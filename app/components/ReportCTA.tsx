"use client";

import { useState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface Props {
  scanId: string;
}

type CouponState = "idle" | "validating" | "valid" | "invalid";
type CheckoutState = "idle" | "loading" | "error";

const REPORT_BENEFITS = [
  "Every issue explained in plain English",
  "Fix priorities ranked by revenue impact",
  "Easy wins section — fixes under 1 hour",
  "What to tell your web developer",
] as const;

export function ReportCTA({ scanId }: Props) {
  const emailId = useId();
  const couponId = useId();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [couponVisible, setCouponVisible] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState<CouponState>("idle");
  const [couponError, setCouponError] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [checkoutError, setCheckoutError] = useState("");

  // ── Email validation ─────────────────────────────────────────────────────
  function validateEmail(value: string): boolean {
    if (!value.trim()) {
      setEmailError("Email is required");
      return false;
    }
    // RFC 5322 simplified check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  }

  // ── Coupon validation (server-side) ──────────────────────────────────────
  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) return;

    setCouponState("validating");
    setCouponError("");
    setDiscountPercent(0);

    try {
      const res = await fetch("/api/coupon-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code }),
      });

      if (!res.ok) {
        const { error } = (await res.json()) as { error?: string };
        setCouponState("invalid");
        setCouponError(error ?? "Invalid coupon code");
        return;
      }

      const { discountPercent: pct } = (await res.json()) as {
        discountPercent: number;
      };
      setDiscountPercent(pct);
      setCouponState("valid");
    } catch {
      setCouponState("invalid");
      setCouponError("Could not validate coupon. Please try again.");
    }
  }

  // ── Checkout ─────────────────────────────────────────────────────────────
  async function handleGetReport() {
    if (!validateEmail(email)) return;

    setCheckoutState("loading");
    setCheckoutError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          email: email.trim(),
          couponCode: couponState === "valid" ? couponCode.trim() : undefined,
        }),
      });

      const data = (await res.json()) as {
        url?: string;
        reportId?: string;
        free?: boolean;
        error?: string;
      };

      if (!res.ok) {
        setCheckoutState("error");
        setCheckoutError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.free && data.reportId) {
        // 100% discount — navigate straight to report
        window.location.href = `/report/${scanId}`;
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutState("error");
      setCheckoutError("Unexpected response from server.");
    } catch {
      setCheckoutState("error");
      setCheckoutError("Network error. Please check your connection and try again.");
    }
  }

  // ── Derived display values ────────────────────────────────────────────────
  const isFree = couponState === "valid" && discountPercent === 100;
  const displayPrice =
    couponState === "valid" && discountPercent > 0 && discountPercent < 100
      ? `£${((2900 * (1 - discountPercent / 100)) / 100).toFixed(2)}`
      : "£29";

  return (
    <Card padding="lg" className="mt-10">
      {/* Headline */}
      <h2 className="font-sans text-2xl text-text-primary sm:text-3xl">
        Get your full report
      </h2>
      <p className="mt-2 text-text-secondary">
        A personalised PDF sent straight to your inbox.
      </p>

      {/* Benefits list */}
      <ul className="mt-5 space-y-2" aria-label="What is included">
        {REPORT_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-text-secondary">
            <span
              className="mt-0.5 flex-shrink-0 text-accent"
              aria-hidden="true"
            >
              ✓
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      {/* Email input */}
      <div className="mt-7">
        <label
          htmlFor={emailId}
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Your email
        </label>
        <Input
          id={emailId}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          onBlur={() => {
            if (email) validateEmail(email);
          }}
          error={emailError}
          aria-required="true"
        />
      </div>

      {/* Coupon toggle */}
      <div className="mt-4">
        {!couponVisible ? (
          <button
            type="button"
            onClick={() => setCouponVisible(true)}
            className="text-sm text-text-tertiary underline underline-offset-2 transition-colors hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Have a coupon code?
          </button>
        ) : null}

        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maxHeight: couponVisible ? "300px" : "0",
            opacity: couponVisible ? 1 : 0,
          }}
        >
          <div className="pt-1">
            <label
              htmlFor={couponId}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Coupon code
            </label>
            <div className="flex gap-2">
              <Input
                id={couponId}
                type="text"
                placeholder="NEURO20"
                autoComplete="off"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponState !== "idle") {
                    setCouponState("idle");
                    setCouponError("");
                    setDiscountPercent(0);
                  }
                }}
                error={couponState === "invalid" ? couponError : undefined}
                aria-label="Coupon code"
                className="uppercase"
              />
              <Button
                variant="secondary"
                size="md"
                onClick={handleApplyCoupon}
                loading={couponState === "validating"}
                disabled={!couponCode.trim() || couponState === "validating"}
                className="flex-shrink-0"
              >
                Apply
              </Button>
            </div>

            {/* Coupon success feedback */}
            {couponState === "valid" ? (
              <p
                role="status"
                className="mt-2 text-sm font-medium text-green-600 dark:text-green-400"
              >
                {isFree
                  ? "100% off — your report is free!"
                  : `${discountPercent}% off applied — you pay ${displayPrice}`}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* CTA button */}
      <div className="mt-6">
        <Button
          size="lg"
          onClick={handleGetReport}
          loading={checkoutState === "loading"}
          disabled={checkoutState === "loading"}
          className="w-full sm:w-auto"
          aria-label={
            isFree
              ? "Get your free report"
              : `Get full report for ${displayPrice}`
          }
        >
          {checkoutState === "loading"
            ? "Preparing your report…"
            : isFree
              ? "Get Free Report"
              : `Get Full Report — ${displayPrice}`}
        </Button>

        {/* Checkout error */}
        {checkoutState === "error" ? (
          <p
            role="alert"
            className="mt-3 text-sm text-severity-critical"
          >
            {checkoutError}
          </p>
        ) : null}
      </div>

      {/* Trust copy */}
      <p className="mt-4 text-xs text-text-tertiary">
        Secure payment via Stripe. No subscription — one-time payment only.
      </p>
    </Card>
  );
}
