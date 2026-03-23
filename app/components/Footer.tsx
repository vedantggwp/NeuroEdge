import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-extrabold text-lg tracking-tight text-navy">
          Neuro<span className="text-accent">Edge</span>
        </p>
        <p className="text-[0.8125rem] text-text-secondary italic">
          Every customer counts. Especially the ones your website is turning away.
        </p>
        <nav aria-label="Legal" className="flex items-center gap-5">
          <a href="/privacy" className="py-2 text-xs text-text-tertiary transition-colors hover:text-accent">Privacy</a>
          <a href="/terms" className="py-2 text-xs text-text-tertiary transition-colors hover:text-accent">Terms</a>
          <a href="/accessibility" className="py-2 text-xs text-text-tertiary transition-colors hover:text-accent">Accessibility</a>
        </nav>
        <p className="text-xs text-text-tertiary">
          Built in {SITE.location} &middot; 2026
        </p>
      </div>
    </footer>
  );
}
