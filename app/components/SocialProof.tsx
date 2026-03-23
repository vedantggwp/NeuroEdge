"use client";

import { Card } from "@/components/ui/Card";

const STATS = [
  {
    stat: "30 out of 30",
    label: "Liverpool businesses we checked had problems. Every. Single. One.",
    source: "NeuroEdge audit, Feb 2026",
  },
  {
    stat: "1 in 4",
    label: "of your visitors has a disability or uses the web differently. That is a quarter of your customers.",
    source: "Family Resources Survey, DWP 2023",
  },
  {
    stat: "71%",
    label: "of people who struggle to use a website just leave. They do not complain. They go to your competitor.",
    source: "Click-Away Pound Survey 2019",
  },
] as const;

export function SocialProof() {
  return (
    <section
      id="stats"
      aria-labelledby="social-proof-heading"
      className="px-6 py-16 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="reveal">
          <div className="flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.12em] uppercase text-accent mb-4">
            <span className="block w-3 h-px bg-accent" aria-hidden="true" />
            Why This Matters
          </div>
          <h2
            id="social-proof-heading"
            className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] leading-[1.1] text-navy mb-4"
          >
            You are probably losing customers<br />right now. You just cannot see it.
          </h2>
          <p className="text-[1.0625rem] text-text-secondary max-w-[520px] leading-relaxed">
            We checked 30 real business websites across Liverpool. Every single one had problems that stop disabled visitors from using them. Yours probably does too.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
          {STATS.map((item) => (
            <Card key={item.stat} padding="lg" className="reveal h-full">
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <p
                  className="font-extrabold text-navy tracking-[-0.04em] leading-none mb-4 text-[clamp(2.5rem,5vw,3.5rem)]"
                  data-stat={item.stat}
                >
                  {item.stat}
                </p>
                <p className="text-[0.9375rem] text-text-secondary leading-relaxed max-w-[260px]">
                  {item.label}
                </p>
                <p className="text-[0.6875rem] text-text-tertiary mt-4 font-medium uppercase tracking-[0.06em]">
                  {item.source}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
