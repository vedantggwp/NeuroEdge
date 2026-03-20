"use client";

import { motion, type Variants } from "framer-motion";
import { SOCIAL_PROOF } from "@/lib/constants";
import { Card } from "@/components/ui/Card";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 18,
      delay: i * 0.12,
    },
  }),
};

export function SocialProof() {
  return (
    <section
      aria-labelledby="social-proof-heading"
      className="mx-auto w-full max-w-5xl px-[var(--section-x)] py-[var(--section-y)]"
    >
      <h2 id="social-proof-heading" className="sr-only">
        Why accessibility matters
      </h2>

      <div className="grid gap-6 sm:grid-cols-3">
        {SOCIAL_PROOF.map((item, i) => (
          <motion.div
            key={item.stat}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
          >
            <Card padding="lg" className="text-center h-full flex flex-col justify-between">
              <div>
                <p className="text-4xl font-semibold tracking-tight text-accent sm:text-5xl">
                  {item.stat}
                </p>
                <p className="mt-3 text-base leading-relaxed text-text-primary sm:text-lg">
                  {item.label}
                </p>
              </div>
              <p className="mt-4 text-xs text-text-tertiary">{item.source}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
