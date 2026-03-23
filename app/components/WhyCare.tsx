import { Card } from "@/components/ui/Card";

export function WhyCare() {
  return (
    <section
      id="why-care"
      aria-labelledby="why-care-heading"
      className="py-28 px-6 bg-bg-subtle"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="reveal">
          <div className="flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.12em] uppercase text-accent mb-4">
            <span className="block w-3 h-px bg-accent" aria-hidden="true" />
            Why Should You Care
          </div>
          <h2
            id="why-care-heading"
            className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] leading-[1.1] text-navy mb-4"
          >
            It is not just about doing the right thing.<br />It is the law.
          </h2>
          <p className="text-[1.0625rem] text-text-secondary max-w-[520px] leading-relaxed mb-16">
            The Equality Act 2010 requires your website to be accessible to everyone. Most businesses have no idea they are breaking it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="lg" className="reveal">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[14px] bg-accent-subtle text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[22px] h-[22px]">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy mb-2">14.1 million people</h3>
                <p className="text-[0.9375rem] text-text-secondary leading-relaxed">
                  That is how many disabled people live in the UK. Together they have a combined spending power of £274 billion per year. If your website does not work for them, that money goes to someone whose website does.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="reveal">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[14px] bg-accent-subtle text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[22px] h-[22px]">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy mb-2">The Equality Act 2010</h3>
                <p className="text-[0.9375rem] text-text-secondary leading-relaxed">
                  Your website counts as a service. If disabled people cannot use it, you could be breaking the law. Enforcement is increasing and the first wave of legal action is already hitting UK businesses.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="reveal">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[14px] bg-accent-subtle text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[22px] h-[22px]">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy mb-2">They do not complain</h3>
                <p className="text-[0.9375rem] text-text-secondary leading-relaxed">
                  When someone cannot use your website, they do not fill in a feedback form. They just leave. Quietly. And they go straight to a competitor whose site works for them.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="reveal border-2 border-accent/30 bg-accent-subtle">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[14px] bg-accent text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[22px] h-[22px]">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy mb-2">Did You Know?</h3>
                <p className="text-[0.9375rem] text-text-secondary leading-relaxed">
                  For every £1 you spend fixing accessibility problems, you could see £100 back in revenue from customers who can finally use your site. Most fixes are simple, fast, and surprisingly affordable.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
