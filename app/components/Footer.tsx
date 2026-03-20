import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-[var(--section-x)] py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center">
        <p className="font-serif text-lg text-text-primary">{SITE.name}</p>
        <p className="text-sm text-text-tertiary">
          Built with care in {SITE.location}
        </p>
      </div>
    </footer>
  );
}
