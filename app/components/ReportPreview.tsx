"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SURFACE_CARD_CLASS =
  "rounded-[20px] border border-[rgba(15,43,76,0.06)] bg-white shadow-[0_4px_16px_rgba(15,43,76,0.06),0_1px_3px_rgba(15,43,76,0.04)]";

const SUMMARY_STATS = [
  { label: "Issues found", value: "12", tone: "text-[#0F2B4C]" },
  { label: "Easy fixes", value: "5", tone: "text-[#2DD4A8]" },
  { label: "Medium", value: "4", tone: "text-[#F59E0B]" },
  { label: "Hard", value: "3", tone: "text-[#EF4444]" },
] as const;

type IssueCardPreview = {
  severity: string;
  title: string;
  detail: string;
  stripeClassName: string;
  badge?: string;
  badgeClassName?: string;
};

const ISSUE_CARDS: readonly IssueCardPreview[] = [
  {
    severity: "Easy fix",
    title: "Booking form fields are missing labels",
    detail: "You can patch the Elementor form block without touching code.",
    stripeClassName: "bg-[#2DD4A8]",
    badge: "You Can Fix This ✓",
    badgeClassName:
      "bg-[#2DD4A8] text-white shadow-[0_4px_16px_rgba(15,43,76,0.06),0_1px_3px_rgba(15,43,76,0.04)]",
  },
  {
    severity: "Needs code",
    title: "Contrast on the main CTA falls below WCAG AA",
    detail: "Package this one for a developer so the button system is fixed once.",
    stripeClassName: "bg-[#F59E0B]",
    badge: "Send to Developer →",
    badgeClassName:
      "bg-[rgba(15,43,76,0.08)] text-[#0F2B4C] shadow-[0_4px_16px_rgba(15,43,76,0.06),0_1px_3px_rgba(15,43,76,0.04)]",
  },
  {
    severity: "Revenue blocker",
    title: "Keyboard users get stuck in the date picker flow",
    detail: "Focus does not return after close, so booking completion drops on desktop.",
    stripeClassName: "bg-[#EF4444]",
  },
] as const;

const FIX_STEPS = [
  "Open the booking form block settings in WordPress or Elementor.",
  "Add visible labels and match each label to its field ID before publishing.",
  "Update the amber CTA token, then rerun the scan to confirm the fix.",
] as const;

const CHEAT_SHEET = [
  'label htmlFor="booking-email"',
  'input id="booking-email"',
  'button aria-describedby="booking-help"',
] as const;

function ScoreDial() {
  const score = 42;
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`${SURFACE_CARD_CLASS} bg-[#FAFBFC] p-5`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[rgba(15,43,76,0.55)]">
        Accessibility score
      </p>
      <div className="mt-4 flex justify-center">
        <div
          role="img"
          aria-label="Accessibility score 42 out of 100"
          className="relative flex h-[120px] w-[120px] items-center justify-center"
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
            className="-rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(15,43,76,0.08)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[28px] font-extrabold tracking-[-0.05em] text-[#F59E0B] [font-variant-numeric:tabular-nums]">
              42
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(15,43,76,0.55)]">
              out of 100
            </span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-[1rem] font-bold tracking-[-0.03em] text-[#0F2B4C]">
        Fix the easy wins first.
      </p>
      <p className="mt-2 text-[13px] leading-6 text-[rgba(15,43,76,0.55)]">
        The top blockers are hurting bookings, form completion, and mobile
        readability.
      </p>
    </div>
  );
}

export function ReportPreview() {
  const rootRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const eyebrow = eyebrowRef.current;
    const panel = panelRef.current;
    const revealGroups = [scoreRef.current, statsRef.current, cardsRef.current]
      .filter((node): node is HTMLDivElement => node !== null);

    if (!root || !eyebrow || !panel || revealGroups.length !== 3) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const conditions = context.conditions as
          | { isMobile?: boolean; reduceMotion?: boolean }
          | undefined;
        const isMobile = Boolean(conditions?.isMobile);
        const reduceMotion = Boolean(conditions?.reduceMotion);

        const ctx = gsap.context(() => {
          if (reduceMotion) {
            gsap.set(eyebrow, { opacity: 1, y: 0 });
            gsap.set(panel, {
              opacity: 1,
              y: 0,
              rotateX: 0,
              rotateY: 0,
              transformOrigin: "center center",
            });
            gsap.set(revealGroups, { opacity: 1, y: 0 });
            return;
          }

          gsap.set(eyebrow, { opacity: 0, y: 18 });
          gsap.set(panel, {
            opacity: 0,
            y: 40,
            rotateX: isMobile ? 0 : 4,
            rotateY: isMobile ? 0 : -8,
            transformOrigin: "center center",
            force3D: !isMobile,
          });
          gsap.set(revealGroups, { opacity: 0, y: 24 });

          const timeline = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: root,
              start: "top 80%",
              once: true,
            },
          });

          timeline
            .to(eyebrow, {
              opacity: 1,
              y: 0,
              duration: 0.5,
            })
            .to(
              panel,
              {
                opacity: 1,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                duration: 0.8,
              },
              0,
            )
            .to(
              revealGroups,
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.15,
              },
              0.2,
            );
        }, root);

        return () => ctx.revert();
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[1000px] px-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[10%] top-14 -z-10 h-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,168,0.16),rgba(45,212,168,0)_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[12%] top-[5.5rem] -z-10 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.14),rgba(245,158,11,0)_72%)] blur-3xl"
      />

      <div className="relative pt-8">
        <div
          ref={eyebrowRef}
          className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 md:left-8 md:translate-x-0"
        >
          <div className="inline-flex rounded-full border border-[rgba(15,43,76,0.06)] bg-[rgba(45,212,168,0.1)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14916B] shadow-[0_4px_16px_rgba(15,43,76,0.06),0_1px_3px_rgba(15,43,76,0.04)]">
            See what you get
          </div>
        </div>

        <div className="[perspective:1200px]">
          <div
            ref={panelRef}
            className="mx-auto w-full max-w-[320px] md:max-w-[940px] [transform-style:preserve-3d] will-change-transform"
          >
            <div className="rounded-[24px] bg-[rgba(15,43,76,0.02)] p-[6px] ring-1 ring-[rgba(15,43,76,0.06)] shadow-[0_8px_40px_rgba(15,43,76,0.08),0_2px_8px_rgba(15,43,76,0.04)]">
              <div className="overflow-hidden rounded-[calc(24px-6px)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-3 border-b border-[rgba(15,43,76,0.06)] bg-[#FAFBFC] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2" aria-hidden="true">
                    <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                    <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                    <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mx-auto flex h-9 max-w-[320px] items-center justify-center rounded-full bg-[rgba(15,43,76,0.04)] px-4 text-[13px] font-medium text-[rgba(15,43,76,0.55)]">
                      neuroedge.co.uk
                    </div>
                  </div>
                </div>

                <div className="grid bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFBFC_100%)] lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,320px)]">
                  <div className="border-b border-[rgba(15,43,76,0.06)] px-5 py-5 sm:px-7 sm:py-7 lg:border-b-0 lg:border-r">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(15,43,76,0.35)]">
                          Accessibility audit preview
                        </p>
                        <h3 className="mt-3 text-[1.75rem] font-extrabold tracking-[-0.04em] text-[#0F2B4C] sm:text-[2.25rem]">
                          bloom-and-petal.co.uk
                        </h3>
                        <p className="mt-3 max-w-[33rem] text-[14px] leading-7 text-[rgba(15,43,76,0.55)] sm:text-[15px]">
                          Priority fixes ordered by revenue risk, content
                          effort, and developer complexity.
                        </p>
                      </div>

                      <div className={`${SURFACE_CARD_CLASS} max-w-[230px] px-4 py-4`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(15,43,76,0.35)]">
                          Potential monthly recovery
                        </p>
                        <p className="mt-2 font-mono text-[1.8rem] font-extrabold tracking-[-0.04em] text-[#0F2B4C] [font-variant-numeric:tabular-nums]">
                          ~£1,380
                        </p>
                        <p className="mt-2 text-[13px] leading-6 text-[rgba(15,43,76,0.55)]">
                          Based on removing the top friction from the current
                          booking flow.
                        </p>
                      </div>
                    </div>

                    <div ref={cardsRef} className="mt-6 space-y-3">
                      {ISSUE_CARDS.map((issue) => (
                        <div
                          key={issue.title}
                          className={`${SURFACE_CARD_CLASS} relative min-h-[60px] overflow-hidden px-4 py-3`}
                        >
                          <div
                            aria-hidden="true"
                            className={`absolute inset-y-0 left-0 w-1.5 ${issue.stripeClassName}`}
                          />
                          <div className="flex min-h-[36px] items-center pl-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-[14px] font-bold tracking-[-0.02em] text-[#0F2B4C]">
                                  {issue.title}
                                </p>

                                {issue.badge ? (
                                  <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold whitespace-nowrap ${issue.badgeClassName}`}
                                  >
                                    {issue.badge}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 truncate text-[12px] text-[rgba(15,43,76,0.55)]">
                                <span className="font-semibold uppercase tracking-[0.12em] text-[rgba(15,43,76,0.35)]">
                                  {issue.severity}
                                </span>{" "}
                                {issue.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.84fr)]">
                      <div
                        className={`${SURFACE_CARD_CLASS} bg-[rgba(45,212,168,0.08)] px-5 py-4`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#14916B]">
                              CMS-specific fix steps
                            </p>
                            <p className="mt-2 text-[1rem] font-bold tracking-[-0.03em] text-[#0F2B4C]">
                              WordPress Fix Kit
                            </p>
                          </div>
                          <span className="rounded-full bg-[#2DD4A8] px-3 py-1 text-[12px] font-semibold text-white shadow-[0_4px_16px_rgba(15,43,76,0.06),0_1px_3px_rgba(15,43,76,0.04)]">
                            Guided next steps
                          </span>
                        </div>
                        <div className="mt-4 space-y-2">
                          {FIX_STEPS.map((step, index) => (
                            <div
                              key={step}
                              className="rounded-[16px] border border-[rgba(15,43,76,0.06)] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,43,76,0.06),0_1px_3px_rgba(15,43,76,0.04)]"
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#14916B]">
                                Step {index + 1}
                              </p>
                              <p className="mt-1 text-[13px] leading-6 text-[rgba(15,43,76,0.55)]">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`${SURFACE_CARD_CLASS} bg-[#FAFBFC] px-5 py-4`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(15,43,76,0.35)]">
                          Developer cheat sheet
                        </p>
                        <p className="mt-2 text-[1rem] font-bold tracking-[-0.03em] text-[#0F2B4C]">
                          Copy-ready implementation notes
                        </p>
                        <div className="mt-4 space-y-2 rounded-[18px] bg-white p-3 font-mono text-[12px] text-[#35506E] shadow-[inset_0_0_0_1px_rgba(15,43,76,0.06)] [font-variant-numeric:tabular-nums]">
                          {CHEAT_SHEET.map((line) => (
                            <p key={line} className="truncate">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <aside className="bg-[#FAFBFC] px-5 py-5 sm:px-6 sm:py-6">
                    <div ref={scoreRef}>
                      <ScoreDial />
                    </div>

                    <div ref={statsRef} className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {SUMMARY_STATS.map((stat) => (
                          <div
                            key={stat.label}
                            className={`${SURFACE_CARD_CLASS} bg-white px-4 py-4`}
                          >
                            <p
                              className={`font-mono text-[1.55rem] font-extrabold tracking-[-0.05em] [font-variant-numeric:tabular-nums] ${stat.tone}`}
                            >
                              {stat.value}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[rgba(15,43,76,0.35)]">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className={`${SURFACE_CARD_CLASS} bg-white px-5 py-4`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(15,43,76,0.35)]">
                          Revenue snapshot
                        </p>
                        <p className="mt-2 font-mono text-[2rem] font-extrabold tracking-[-0.05em] text-[#0F2B4C] [font-variant-numeric:tabular-nums]">
                          71%
                        </p>
                        <p className="mt-2 text-[13px] leading-6 text-[rgba(15,43,76,0.55)]">
                          of users with access barriers leave instead of asking
                          for help.
                        </p>
                        <div className="mt-4 rounded-[16px] bg-[rgba(45,212,168,0.1)] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#14916B]">
                            Quick win
                          </p>
                          <p className="mt-1 text-[13px] leading-6 text-[#2F5E58]">
                            Prioritise the fixes you can ship from the CMS before
                            touching deeper templates.
                          </p>
                        </div>
                      </div>

                      <div className={`${SURFACE_CARD_CLASS} bg-white px-5 py-4`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(15,43,76,0.35)]">
                          Included in every PDF
                        </p>
                        <ul className="mt-3 space-y-3 text-[13px] leading-6 text-[rgba(15,43,76,0.55)]">
                          <li className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2DD4A8]"
                            />
                            Plain-English issue summaries for owners and
                            marketers.
                          </li>
                          <li className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]"
                            />
                            CMS-specific fix kits plus developer-ready handoff
                            notes.
                          </li>
                          <li className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F2B4C]"
                            />
                            Recovery stats that turn accessibility into a
                            commercial case.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
