"use client";

import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    number: "01",
    title: "Pop in your website address",
    description: "Just paste your website link into the box. That is it. We do the rest.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[22px] h-[22px]">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "We check it and translate what we find",
    description: "Our tool checks your site for problems that stop people using it, then explains each one in plain English. No jargon. No confusing codes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[22px] h-[22px]">
        <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Get your report with a fix list",
    description: "You will see your score, an estimate of the revenue you could be missing out on, and a clear list of what to fix first, in order of what matters most.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[22px] h-[22px]">
        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/>
      </svg>
    ),
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-it-works-heading"
      className="py-28 px-6"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="reveal">
          <div className="flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.12em] uppercase text-accent mb-4">
            <span className="block w-3 h-px bg-accent" aria-hidden="true" />
            How It Works
          </div>
          <h2
            id="how-it-works-heading"
            className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] leading-[1.1] text-navy mb-4"
          >
            Three steps. Two minutes.<br />Zero tech skills needed.
          </h2>
          <p className="text-[1.0625rem] text-text-secondary max-w-[480px] leading-relaxed">
            If you can copy and paste a web address, you can do this.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
          {STEPS.map((step) => (
            <Card key={step.number} padding="lg" className="reveal">
              <div className="text-[0.6875rem] font-bold text-navy tracking-[0.1em] uppercase mb-6 opacity-60">
                {step.number}
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-accent-subtle border border-accent-subtle text-accent mb-6">
                {step.icon}
              </div>
              <h3 className="text-[1.1875rem] font-bold tracking-[-0.02em] text-text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-[0.9375rem] text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
