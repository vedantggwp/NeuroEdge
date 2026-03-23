import { ScanForm } from "@/components/ScanForm";
import { ReportPreview } from "@/components/ReportPreview";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pt-32 pb-24 text-center"
    >
      {/* Eyebrow badge */}
      <div className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-[#15803d]">
        <span
          className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse-dot"
          aria-hidden="true"
        />
        Free Website Check
      </div>

      <h1
        id="hero-heading"
        className="reveal max-w-[800px] text-[clamp(2.75rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-navy"
      >
        Your website is turning away paying customers.{" "}
        <span className="text-accent">Let&#39;s find out how many.</span>
      </h1>

      <p className="reveal mt-6 max-w-[560px] text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-text-secondary">
        Right now, one in four visitors might not be able to use your site properly. They can&#39;t book, can&#39;t buy, can&#39;t even read your menu. We&#39;ll show you exactly what&#39;s going wrong and what it&#39;s costing you. Takes 30 seconds.
      </p>

      <div className="reveal mt-12 w-full max-w-xl">
        <ScanForm />
      </div>

      <p className="reveal mt-4 text-xs text-text-tertiary tracking-wide">
        No signup. No card. Results on screen in 30 seconds.
      </p>

      <div className="mt-16 w-full">
        <ReportPreview />
      </div>
    </section>
  );
}
