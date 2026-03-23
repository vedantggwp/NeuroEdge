import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Accessibility Statement — ${SITE.name}`,
  description: `Our commitment to making ${SITE.name} accessible to everyone, targeting WCAG 2.1 AA.`,
};

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
      {children}
    </span>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="font-serif text-xl text-[var(--text-primary)]">{title}</h2>
      <div className="space-y-3 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}

export default function AccessibilityStatementPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-[var(--section-x)] pb-20 pt-28"
    >
      <h1 className="mb-4 font-serif text-3xl text-[var(--text-primary)] sm:text-4xl">
        Accessibility Statement
      </h1>
      <p className="mb-12 text-sm text-[var(--text-tertiary)]">
        Last updated: 21 March 2026
      </p>

      <div className="space-y-12">
        <Section label="Commitment" title="Our accessibility goal">
          <p>
            NeuroEdge is committed to ensuring digital accessibility for people
            of all abilities. We target conformance with{" "}
            <strong className="text-[var(--text-primary)]">
              WCAG 2.1 Level AA
            </strong>{" "}
            across our entire website.
          </p>
          <p>
            As a service that helps others improve accessibility, we hold
            ourselves to the same standard we advocate for.
          </p>
        </Section>

        <Section label="What we do" title="Measures we take">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">Semantic HTML</strong> — proper
              heading hierarchy, landmark regions, and ARIA labels throughout.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Keyboard navigation</strong> — all
              interactive elements are fully operable via keyboard with visible
              focus indicators.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Screen reader support</strong> — tested
              with VoiceOver and NVDA to ensure content is announced correctly.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Colour contrast</strong> — all
              text meets or exceeds WCAG AA contrast ratios (4.5:1 for normal
              text, 3:1 for large text).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Skip navigation</strong> — a
              &quot;Skip to main content&quot; link is provided for keyboard
              users.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Reduced motion</strong> — animations
              are suppressed when the user has enabled
              &quot;prefers-reduced-motion&quot; in their operating system.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Responsive design</strong> — the
              interface adapts to all screen sizes and supports text resizing up
              to 200%.
            </li>
          </ul>
        </Section>

        <Section label="Known issues" title="Areas we are improving">
          <p>
            We are aware of the following issues and are working to resolve
            them:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              PDF reports may not yet be fully screen-reader optimised — we are
              adding tagged PDF support.
            </li>
            <li>
              Some chart visualisations may lack text alternatives — we are
              adding data tables as fallbacks.
            </li>
          </ul>
        </Section>

        <Section label="Legal" title="Equality Act 2010">
          <p>
            This website is operated from the United Kingdom. We recognise our
            obligations under the{" "}
            <strong className="text-[var(--text-primary)]">
              Equality Act 2010
            </strong>{" "}
            to make reasonable adjustments to ensure our services are accessible
            to disabled people.
          </p>
        </Section>

        <Section label="Feedback" title="Report an issue">
          <p>
            We welcome your feedback on the accessibility of NeuroEdge. If you
            encounter any barriers or have suggestions for improvement, please
            contact us:
          </p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline decoration-[var(--accent)] underline-offset-2 hover:text-[var(--accent)] transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            We aim to respond to accessibility feedback within{" "}
            <strong className="text-[var(--text-primary)]">5 working days</strong> and to
            resolve reported issues within{" "}
            <strong className="text-[var(--text-primary)]">30 days</strong> where
            technically feasible.
          </p>
        </Section>
      </div>
    </main>
  );
}
