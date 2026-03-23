import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE.name}`,
  description: `How ${SITE.name} collects, uses, and protects your personal data under GDPR.`,
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

export default function PrivacyPolicyPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-[var(--section-x)] pb-20 pt-28"
    >
      <h1 className="mb-4 font-serif text-3xl text-[var(--text-primary)] sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mb-12 text-sm text-[var(--text-tertiary)]">
        Last updated: 21 March 2026
      </p>

      <div className="space-y-12">
        <Section label="Overview" title="Who we are">
          <p>
            NeuroEdge (&quot;we&quot;, &quot;us&quot;) is operated by Vedant
            Gaikwad. We provide automated web accessibility scanning and
            reporting services at{" "}
            <a
              href={SITE.url}
              className="underline decoration-[var(--accent)] underline-offset-2 hover:text-[var(--accent)] transition-colors"
            >
              {SITE.url}
            </a>
            .
          </p>
        </Section>

        <Section label="Collection" title="Data we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">URL submitted</strong> — the
              website address you ask us to scan.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Email address</strong> — only
              if you request a PDF report or subscribe to updates.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Scan results</strong> — accessibility
              score, violations found, and industry classification.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Revenue estimate inputs</strong> — monthly
              visitors, order value, and conversion rate you provide voluntarily.
            </li>
          </ul>
          <p>
            We do not use cookies. We use cookieless, privacy-respecting
            analytics only.
          </p>
        </Section>

        <Section label="Legal basis" title="Why we process your data">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">Legitimate interest</strong> — to
              perform the scan you requested and display results.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Consent</strong> — to send you
              a PDF report via email (you opt in explicitly).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Contract</strong> — to process
              payments and deliver paid services.
            </li>
          </ul>
        </Section>

        <Section label="Storage" title="Where your data is stored">
          <p>
            Data is stored in <strong className="text-[var(--text-primary)]">Supabase</strong> (EU
            region). The application is hosted on{" "}
            <strong className="text-[var(--text-primary)]">Vercel</strong> (edge network with EU
            processing). All connections are encrypted via TLS.
          </p>
        </Section>

        <Section label="Third parties" title="Services we use">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">Supabase</strong> — database and
              authentication (EU region).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Vercel</strong> — application
              hosting and serverless functions.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Google Gemini</strong> — AI-powered
              scan result translation and report generation.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Resend</strong> — transactional
              email delivery for PDF reports.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Stripe</strong> — payment
              processing (Stripe handles all card data; we never see your full
              card number).
            </li>
          </ul>
        </Section>

        <Section label="Retention" title="How long we keep your data">
          <p>
            Scan results and associated data are retained for{" "}
            <strong className="text-[var(--text-primary)]">12 months</strong> from the date of the
            scan. After that period, data is automatically deleted. You can
            request earlier deletion at any time.
          </p>
        </Section>

        <Section label="Your rights" title="Your rights under GDPR">
          <p>You have the right to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">Access</strong> — request a copy
              of all personal data we hold about you.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Rectification</strong> — correct
              inaccurate data.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Erasure</strong> — request
              deletion of your data.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Portability</strong> — receive
              your data in a machine-readable format.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Objection</strong> — object to
              processing based on legitimate interest.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Withdraw consent</strong> — at
              any time, without affecting the lawfulness of prior processing.
            </li>
          </ul>
        </Section>

        <Section label="Contact" title="How to reach us">
          <p>
            For any privacy-related requests, email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline decoration-[var(--accent)] underline-offset-2 hover:text-[var(--accent)] transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            . We aim to respond within 30 days.
          </p>
          <p>
            If you are not satisfied with our response, you have the right to
            lodge a complaint with the{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--accent)] underline-offset-2 hover:text-[var(--accent)] transition-colors"
            >
              Information Commissioner&apos;s Office (ICO)
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}
