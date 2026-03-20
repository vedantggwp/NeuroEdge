"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { ScanProgress } from "@/components/ScanProgress";
import { ScoreRing } from "@/components/ScoreRing";
import { IssueList } from "@/components/IssueList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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

      {/* Placeholder for revenue form + report CTA */}
      <Card padding="lg" className="text-center">
        <p className="text-lg font-medium text-text-primary">
          Revenue estimate and full report coming soon
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          We are building tools to show you exactly how much revenue
          accessibility gaps may be costing your business.
        </p>
      </Card>
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
