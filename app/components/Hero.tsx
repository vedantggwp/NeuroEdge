import { SITE } from "@/lib/constants";
import { ScanForm } from "@/components/ScanForm";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="flex flex-col items-center px-[var(--section-x)] pt-32 pb-20 text-center sm:pt-40 sm:pb-28"
    >
      <h1
        id="hero-heading"
        className="max-w-3xl font-serif text-4xl leading-[1.15] font-normal tracking-tight text-text-primary sm:text-5xl md:text-6xl"
      >
        {SITE.tagline}
      </h1>

      <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-secondary sm:text-xl">
        Free 30-second scan. See what you&apos;re missing.
      </p>

      <div className="mt-10 w-full max-w-xl">
        <ScanForm />
      </div>
    </section>
  );
}
