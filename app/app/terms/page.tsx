import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE.name}`,
  description: `Terms and conditions for using the ${SITE.name} accessibility scanning service.`,
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

export default function TermsOfServicePage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-[var(--section-x)] pb-20 pt-28"
    >
      <h1 className="mb-4 font-serif text-3xl text-[var(--text-primary)] sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mb-12 text-sm text-[var(--text-tertiary)]">
        Last updated: 21 March 2026
      </p>

      <div className="space-y-12">
        <Section label="Service" title="What NeuroEdge provides">
          <p>
            NeuroEdge provides automated web accessibility scanning. Our tool
            analyses publicly available web pages against WCAG 2.1 guidelines
            and generates a score, violation list, and optional PDF report.
          </p>
        </Section>

        <Section label="Disclaimer" title="Automated scan limitations">
          <p>
            Scans are performed by automated tools and{" "}
            <strong className="text-[var(--text-primary)]">
              do not constitute a full accessibility audit
            </strong>
            . Automated testing typically catches 30-40% of accessibility
            issues. Results should not be relied upon as legal advice or as
            proof of compliance with the Equality Act 2010 or any other
            legislation.
          </p>
          <p>
            We recommend combining our automated scan with manual expert review
            for comprehensive compliance.
          </p>
        </Section>

        <Section label="Warranty" title="No warranty">
          <p>
            The service is provided{" "}
            <strong className="text-[var(--text-primary)]">
              &quot;as is&quot; and &quot;as available&quot;
            </strong>{" "}
            without warranties of any kind, whether express or implied,
            including but not limited to implied warranties of merchantability,
            fitness for a particular purpose, or non-infringement.
          </p>
          <p>
            We do not guarantee that scan results are complete, accurate, or
            up-to-date. Website content and structure may change between scans.
          </p>
        </Section>

        <Section label="Use" title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Use the service to scan websites you do not own or have
              authorisation to test.
            </li>
            <li>
              Attempt to overload, disrupt, or reverse-engineer the service.
            </li>
            <li>
              Use scan results to harass, threaten, or extort website owners.
            </li>
            <li>
              Resell or redistribute scan results without our prior written
              consent.
            </li>
            <li>
              Submit URLs that host illegal content.
            </li>
          </ul>
        </Section>

        <Section label="Liability" title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, NeuroEdge shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenues, whether
            incurred directly or indirectly, arising from your use of the
            service.
          </p>
        </Section>

        <Section label="Payments" title="Refund policy">
          <p>
            For paid services (PDF reports, premium scans), refund requests must
            be submitted within{" "}
            <strong className="text-[var(--text-primary)]">14 days</strong> of
            purchase. Refunds are issued at our discretion. If we are unable to
            deliver the service (e.g., scan failure), a full refund will be
            provided automatically.
          </p>
          <p>
            All payments are processed securely through Stripe. We do not store
            your payment card details.
          </p>
        </Section>

        <Section label="Jurisdiction" title="Governing law">
          <p>
            These terms are governed by and construed in accordance with the
            laws of{" "}
            <strong className="text-[var(--text-primary)]">
              England and Wales
            </strong>
            . Any disputes arising under these terms shall be subject to the
            exclusive jurisdiction of the courts of England and Wales.
          </p>
        </Section>

        <Section label="Changes" title="Updates to these terms">
          <p>
            We may update these terms from time to time. Material changes will
            be communicated via email to registered users. Continued use of the
            service after changes constitutes acceptance of the updated terms.
          </p>
        </Section>

        <Section label="Contact" title="Get in touch">
          <p>
            Questions about these terms? Email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline decoration-[var(--accent)] underline-offset-2 hover:text-[var(--accent)] transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}
