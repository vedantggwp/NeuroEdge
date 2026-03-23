"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Card } from "@/components/ui/Card";
import { ACCESSIBILITY_STATS } from "@/lib/constants";
import type { RevenueEstimate } from "@/lib/revenue";

interface RevenueResultProps {
  estimate: RevenueEstimate;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Animated count-up for a single number */
function CountUp({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !spanRef.current) {
      if (spanRef.current) {
        spanRef.current.textContent = `${prefix}${Math.round(target).toLocaleString("en-GB")}${suffix}`;
      }
      return;
    }

    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: target,
      duration: 1.2,
      ease: "power2.out",
      onUpdate() {
        if (spanRef.current) {
          spanRef.current.textContent = `${prefix}${Math.round(counter.val).toLocaleString("en-GB")}${suffix}`;
        }
      },
    });

    return () => { tween.kill(); };
  }, [target, prefix, suffix]);

  return (
    <span ref={spanRef}>
      {prefix}0{suffix}
    </span>
  );
}

interface FormulaRowProps {
  children: React.ReactNode;
}

function FormulaRow({ children }: FormulaRowProps) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
        aria-hidden="true"
      />
      <span className="text-sm leading-relaxed text-text-secondary">{children}</span>
    </li>
  );
}

export function RevenueResult({ estimate }: RevenueResultProps) {
  const reduced = prefersReducedMotion();
  const {
    disabledVisitors,
    lostVisitors,
    recoveredLow,
    recoveredHigh,
    revenueUpliftLow,
    revenueUpliftHigh,
  } = estimate;

  const { disabledPopulationPercent, clickAwayRate, recoveryRateLow, recoveryRateHigh, source } =
    ACCESSIBILITY_STATS;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Headline */}
      <Card padding="lg" className="border-[var(--revenue)] bg-[var(--revenue-bg)]">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--revenue)]">
          Potential monthly uplift
        </p>
        <p
          className="mt-2 font-sans text-4xl font-bold text-[var(--revenue)] sm:text-5xl"
          aria-label={`You could be making £${revenueUpliftLow.toLocaleString("en-GB")} to £${revenueUpliftHigh.toLocaleString("en-GB")} more per month`}
        >
          {reduced ? (
            <>
              £{revenueUpliftLow.toLocaleString("en-GB")} – £{revenueUpliftHigh.toLocaleString("en-GB")}
            </>
          ) : (
            <>
              <CountUp target={revenueUpliftLow} prefix="£" /> –{" "}
              <CountUp target={revenueUpliftHigh} prefix="£" />
            </>
          )}
          <span className="ml-2 text-xl font-normal">/month</span>
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Based on fixing your top accessibility issues and recovering lost disabled visitors.
        </p>
      </Card>

      {/* Formula breakdown */}
      <Card padding="md">
        <h3 className="mb-2 font-medium text-text-primary">How we calculated this</h3>
        <ul className="divide-y divide-border" role="list">
          <FormulaRow>
            <strong>{disabledVisitors.toLocaleString("en-GB")}</strong> of your visitors have a
            disability ({disabledPopulationPercent * 100}% of UK population, Family Resources Survey
            2023)
          </FormulaRow>
          <FormulaRow>
            <strong>{(clickAwayRate * 100)}%</strong> leave sites they can't use ={" "}
            <strong>{lostVisitors.toLocaleString("en-GB")} lost visitors</strong> every month
            (Click-Away Pound Survey 2019)
          </FormulaRow>
          <FormulaRow>
            Fixing your top issues recovers{" "}
            <strong>{recoveryRateLow * 100}–{recoveryRateHigh * 100}%</strong> ={" "}
            <strong>
              {recoveredLow.toLocaleString("en-GB")}–{recoveredHigh.toLocaleString("en-GB")} visitors
            </strong>{" "}
            back (WebAIM Million 2025)
          </FormulaRow>
          <FormulaRow>
            At your conversion rate and average order value ={" "}
            <strong className="text-[var(--revenue)]">
              £{revenueUpliftLow.toLocaleString("en-GB")} – £{revenueUpliftHigh.toLocaleString("en-GB")}
              /month
            </strong>
          </FormulaRow>
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-text-tertiary">
          Sources: {source}. Estimates are indicative and based on sector averages — actual results
          will vary.
        </p>
      </Card>
    </div>
  );
}
