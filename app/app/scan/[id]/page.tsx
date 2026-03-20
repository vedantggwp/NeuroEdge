"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { ScanProgress } from "@/components/ScanProgress";
import { ScoreRing } from "@/components/ScoreRing";
import { IssueList } from "@/components/IssueList";
import { RevenueForm } from "@/components/RevenueForm";
import { RevenueResult } from "@/components/RevenueResult";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { calculateRevenueUplift, type RevenueEstimate } from "@/lib/revenue";
import type { IndustryKey } from "@/lib/constants";
import type { Issue } from "@/components/IssueCard";

interface ScanData {
  id: string;
  url: string;
  score: number;
  total_violations: number;
  top_issues: Issue[];
  created_at: string;
}

type LoadingState = "loading" | "ready" | "error";

interface RevenueFormInput {
  industry: IndustryKey;
  monthlyVisitors: number;
  avgOrderValue: number;
  conversionRate: number;
}

export default function ScanResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const prefersReducedMotion = useReducedMotion();

  const [state, setState] = useState<LoadingState>("loading");
  const [scan, setScan] = useState<ScanData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [revenueEstimate, setRevenueEstimate] = useState<RevenueEstimate | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  const fetchScan = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("scans")
      .select("id, url, score, total_violations, top_issues, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      setErrorMsg("Scan not found. It may still be processing or the link is invalid.");
      setState("error");
      return;
    }

    setScan(data as ScanData);
    setState("ready");
  }, [id]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  async function handleRevenueSubmit(input: RevenueFormInput) {
    setRevenueLoading(true);
    try {
      // Calculate client-side immediately for instant feedback
      const estimate = calculateRevenueUplift({
        monthlyVisitors: input.monthlyVisitors,
        avgOrderValue: input.avgOrderValue,
        conversionRate: input.conversionRate,
      });
      setRevenueEstimate(estimate);

      // Persist best-effort — don't block on failure
      await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId: id, ...input }),
      }).catch((err) => console.warn("Could not persist revenue estimate:", err));
    } catch (err) {
      console.error("Revenue calculation failed:", err);
    } finally {
      setRevenueLoading(false);
    }
  }

  /* Loading state */
  if (state === "loading") {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-[var(--section-x)] pt-20">
        <ScanProgress />
      </main>
    );
  }

  /* Error state */
  if (state === "error" || !scan) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-[var(--section-x)] pt-20">
        <h1 className="font-serif text-2xl text-text-primary">
          Something went wrong
        </h1>
        <p className="max-w-md text-center text-text-secondary">{errorMsg}</p>
        <Button variant="secondary" onClick={() => { setState("loading"); fetchScan(); }}>
          Try again
        </Button>
      </main>
    );
  }

  /* Results */
  return (
    <main className="mx-auto max-w-3xl px-[var(--section-x)] pb-20 pt-24">
      {/* Header */}
      <motion.div
        className="mb-10 text-center"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
      >
        <h1 className="font-serif text-3xl text-text-primary sm:text-4xl">
          Scan Results
        </h1>
        <p className="mt-2 text-text-secondary">
          <a
            href={scan.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-accent underline-offset-2 transition-colors hover:text-accent"
          >
            {scan.url}
          </a>
        </p>
      </motion.div>

      {/* Score ring */}
      <motion.div
        className="mb-12 flex justify-center"
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { delay: 0.2, duration: 0.6, type: "spring", stiffness: 120 }
        }
      >
        <ScoreRing score={scan.score} />
      </motion.div>

      {/* Summary stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Score" value={`${scan.score}/100`} />
        <StatCard label="Total Violations" value={String(scan.total_violations)} />
        <StatCard
          label="Scanned"
          value={new Date(scan.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        />
      </div>

      {/* Issue list */}
      <div className="mb-12">
        <IssueList issues={scan.top_issues} />
      </div>

      {/* Revenue estimate section */}
      <motion.section
        aria-labelledby="revenue-heading"
        className="space-y-8"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.4, duration: 0.5 }}
      >
        <div>
          <h2
            id="revenue-heading"
            className="font-serif text-2xl text-text-primary sm:text-3xl"
          >
            How much could you be making?
          </h2>
          <p className="mt-2 text-text-secondary">
            Answer three quick questions and we'll show you the revenue your
            accessibility gaps are costing you — with every number shown.
          </p>
        </div>

        <Card padding="lg">
          {revenueEstimate ? (
            <div className="space-y-8">
              <RevenueResult estimate={revenueEstimate} />
              <div className="border-t border-border pt-6">
                <p className="mb-4 text-sm text-text-secondary">
                  Want to try different numbers?
                </p>
                <RevenueForm
                  onSubmit={handleRevenueSubmit}
                  loading={revenueLoading}
                />
              </div>
            </div>
          ) : (
            <RevenueForm
              onSubmit={handleRevenueSubmit}
              loading={revenueLoading}
            />
          )}
        </Card>
      </motion.section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm" className="text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums text-text-primary">
        {value}
      </p>
    </Card>
  );
}
