"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ── Types ──────────────────────────────────────────────────────────────────

type ReportStatus = "pending" | "generating" | "sent" | "failed";

interface ReportRecord {
  id: string;
  scan_id: string;
  email: string;
  status: ReportStatus;
  sent_at: string | null;
  created_at: string;
}

type PageState =
  | { phase: "lookup" }          // no session_id: show email input
  | { phase: "loading" }         // fetching report from Supabase
  | { phase: "found"; report: ReportRecord }
  | { phase: "not-found" }
  | { phase: "error"; message: string };

// ── Constants ───────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 10_000;
const STUCK_PENDING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const ACTIVE_STATUSES: ReadonlySet<ReportStatus> = new Set([
  "pending",
  "generating",
]);

// ── Helpers ─────────────────────────────────────────────────────────────────

function isStuckPending(report: ReportRecord): boolean {
  if (report.status !== "pending") return false;
  const age = Date.now() - new Date(report.created_at).getTime();
  return age > STUCK_PENDING_THRESHOLD_MS;
}

function shouldShowRegenerate(report: ReportRecord): boolean {
  return report.status === "failed" || isStuckPending(report);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PulsingDot({ color = "bg-accent" }: { color?: string }) {
  return (
    <span className="relative inline-flex h-3 w-3" aria-hidden="true">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`}
      />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${color}`} />
    </span>
  );
}

interface StatusDisplayProps {
  report: ReportRecord;
  onRegenerate: () => void;
  regenerating: boolean;
}

function StatusDisplay({ report, onRegenerate, regenerating }: StatusDisplayProps) {
  const showRegenerate = shouldShowRegenerate(report);

  const statusContent: Record<ReportStatus, React.ReactNode> = {
    pending: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <PulsingDot />
          <h1 className="font-serif text-2xl text-text-primary sm:text-3xl">
            Your report is being prepared
          </h1>
        </div>
        <p className="text-base leading-relaxed text-text-secondary">
          This usually takes 2–3 minutes. We&apos;ll email it to{" "}
          <strong className="text-text-primary">{report.email}</strong> as soon
          as it&apos;s ready. You can safely close this tab.
        </p>
        {showRegenerate && (
          <p className="rounded-lg bg-severity-serious-bg px-4 py-3 text-sm text-severity-serious">
            This is taking longer than expected. You can try regenerating below.
          </p>
        )}
      </div>
    ),
    generating: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <PulsingDot color="bg-accent" />
          <h1 className="font-serif text-2xl text-text-primary sm:text-3xl">
            Almost there&hellip;
          </h1>
        </div>
        <p className="text-base leading-relaxed text-text-secondary">
          We&apos;re translating your results into plain English and building
          your personalised fixes. Sending to{" "}
          <strong className="text-text-primary">{report.email}</strong> shortly.
        </p>
      </div>
    ),
    sent: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-revenue-bg text-revenue"
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8l3.5 3.5 6.5-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1 className="font-serif text-2xl text-text-primary sm:text-3xl">
            Report sent
          </h1>
        </div>
        <p className="text-base leading-relaxed text-text-secondary">
          Your report was sent to{" "}
          <strong className="text-text-primary">{report.email}</strong>
          {report.sent_at ? ` on ${formatDate(report.sent_at)}` : ""}.
        </p>
        <p className="text-sm text-text-tertiary">
          Can&apos;t find it? Check your spam folder, or email{" "}
          <a
            href="mailto:ved@neuroedge.co.uk"
            className="underline decoration-accent underline-offset-2 transition-colors hover:text-accent"
          >
            ved@neuroedge.co.uk
          </a>{" "}
          and we&apos;ll resend it.
        </p>
      </div>
    ),
    failed: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-severity-critical-bg text-severity-critical"
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 5v4M8 11h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <h1 className="font-serif text-2xl text-text-primary sm:text-3xl">
            Something went wrong
          </h1>
        </div>
        <p className="text-base leading-relaxed text-text-secondary">
          We hit a snag generating your report. Email{" "}
          <a
            href="mailto:ved@neuroedge.co.uk"
            className="underline decoration-accent underline-offset-2 transition-colors hover:text-accent"
          >
            ved@neuroedge.co.uk
          </a>{" "}
          and we&apos;ll sort this out personally.
        </p>
      </div>
    ),
  };

  return (
    <div className="space-y-6">
      {statusContent[report.status]}

      {showRegenerate && (
        <Button
          variant="secondary"
          onClick={onRegenerate}
          loading={regenerating}
          disabled={regenerating}
        >
          {regenerating ? "Regenerating…" : "Regenerate Report"}
        </Button>
      )}
    </div>
  );
}

// ── Email lookup form ────────────────────────────────────────────────────────

interface EmailLookupProps {
  onSubmit: (email: string) => void;
  loading: boolean;
  error: string;
}

function EmailLookupForm({ onSubmit, loading, error }: EmailLookupProps) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) onSubmit(email.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="report-email"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Enter the email address you used at checkout
        </label>
        <Input
          id="report-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={error || undefined}
        />
      </div>
      <Button type="submit" loading={loading} disabled={!email.trim()}>
        Find my report
      </Button>
    </form>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ReportStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: scanId } = use(params);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const prefersReducedMotion = useReducedMotion();

  const [pageState, setPageState] = useState<PageState>(
    sessionId ? { phase: "loading" } : { phase: "lookup" },
  );
  const [emailLookupLoading, setEmailLookupLoading] = useState(false);
  const [emailLookupError, setEmailLookupError] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  // Track whether polling is active
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch report by stripe session ──────────────────────────────────────

  const fetchBySessionId = useCallback(async (): Promise<ReportRecord | null> => {
    if (!sessionId) return null;

    const { data, error } = await getSupabase()
      .from("reports")
      .select("id, scan_id, email, status, sent_at, created_at")
      .eq("stripe_session_id", sessionId)
      .eq("scan_id", scanId)
      .single();

    if (error || !data) {
      // Report may not exist yet (webhook hasn't fired) — keep polling
      return null;
    }

    return data as ReportRecord;
  }, [sessionId, scanId]);

  // ── Fetch report by email + scan_id ─────────────────────────────────────

  const fetchByEmail = useCallback(
    async (email: string) => {
      const { data, error } = await getSupabase()
        .from("reports")
        .select("id, scan_id, email, status, sent_at, created_at")
        .eq("scan_id", scanId)
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return data as ReportRecord;
    },
    [scanId],
  );

  // ── Poll the report status ───────────────────────────────────────────────

  const refreshReport = useCallback(
    async (fetchFn: () => Promise<ReportRecord | null>) => {
      const report = await fetchFn();

      if (!report) {
        // Not found yet — keep polling if we're expecting one (session_id path)
        return;
      }

      setPageState({ phase: "found", report });

      // Stop polling once terminal status
      if (!ACTIVE_STATUSES.has(report.status)) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    },
    [],
  );

  // ── Bootstrap: session_id path ──────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function init() {
      const report = await fetchBySessionId();

      if (cancelled) return;

      if (!report) {
        // Webhook may still be processing — show loading and start polling
        setPageState({ phase: "loading" });
      } else {
        setPageState({ phase: "found", report });

        if (ACTIVE_STATUSES.has(report.status)) {
          pollingRef.current = setInterval(() => {
            refreshReport(fetchBySessionId);
          }, POLL_INTERVAL_MS);
        }
        return;
      }

      // Poll until the report record appears
      pollingRef.current = setInterval(async () => {
        if (cancelled) return;
        await refreshReport(fetchBySessionId);
      }, POLL_INTERVAL_MS);
    }

    init().catch((err: unknown) => {
      if (!cancelled) {
        console.error("Failed to fetch report:", err);
        setPageState({ phase: "error", message: "Failed to load report status." });
      }
    });

    return () => {
      cancelled = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [sessionId, fetchBySessionId, refreshReport]);

  // ── Stop polling when report reaches terminal state ──────────────────────

  useEffect(() => {
    if (pageState.phase !== "found") return;
    if (ACTIVE_STATUSES.has(pageState.report.status)) return;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [pageState]);

  // ── Email lookup handler ─────────────────────────────────────────────────

  async function handleEmailLookup(email: string) {
    setEmailLookupLoading(true);
    setEmailLookupError("");

    try {
      const report = await fetchByEmail(email);

      if (!report) {
        setEmailLookupError(
          "No report found for that email and scan. Check the address and try again.",
        );
        setEmailLookupLoading(false);
        return;
      }

      setPageState({ phase: "found", report });

      // Start polling if still active
      if (ACTIVE_STATUSES.has(report.status)) {
        const boundFetch = () => fetchByEmail(email);
        pollingRef.current = setInterval(() => {
          refreshReport(boundFetch);
        }, POLL_INTERVAL_MS);
      }
    } catch (err: unknown) {
      console.error("Email lookup failed:", err);
      setEmailLookupError("Something went wrong. Please try again.");
    } finally {
      setEmailLookupLoading(false);
    }
  }

  // ── Regenerate handler ───────────────────────────────────────────────────

  async function handleRegenerate() {
    if (pageState.phase !== "found") return;

    setRegenerating(true);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: pageState.report.id, scanId }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      // Optimistically reset to pending so polling picks up
      setPageState({
        phase: "found",
        report: { ...pageState.report, status: "pending" },
      });

      // Restart polling
      if (pollingRef.current) clearInterval(pollingRef.current);
      const reportId = pageState.report.id;
      pollingRef.current = setInterval(async () => {
        const { data } = await getSupabase()
          .from("reports")
          .select("id, scan_id, email, status, sent_at, created_at")
          .eq("id", reportId)
          .single();

        if (data) {
          const updated = data as ReportRecord;
          setPageState({ phase: "found", report: updated });
          if (!ACTIVE_STATUSES.has(updated.status)) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        }
      }, POLL_INTERVAL_MS);
    } catch (err: unknown) {
      console.error("Regenerate failed:", err);
    } finally {
      setRegenerating(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

  return (
    <main className="mx-auto max-w-lg px-[var(--section-x)] pb-20 pt-24">
      <AnimatePresence mode="wait">
        {pageState.phase === "loading" && (
          <motion.div key="loading" {...motionProps}>
            <Card padding="lg">
              <div className="flex flex-col items-center gap-6 py-8 text-center">
                <span
                  className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-accent border-r-transparent"
                  role="status"
                  aria-label="Loading report status"
                />
                <div className="space-y-2">
                  <p className="font-serif text-xl text-text-primary">
                    Looking up your report&hellip;
                  </p>
                  <p className="text-sm text-text-secondary">
                    This page will update automatically.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {pageState.phase === "lookup" && (
          <motion.div key="lookup" {...motionProps}>
            <Card padding="lg" className="space-y-6">
              <div>
                <h1 className="font-serif text-2xl text-text-primary sm:text-3xl">
                  Check your report status
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Enter the email address you used when purchasing to find your
                  report.
                </p>
              </div>
              <EmailLookupForm
                onSubmit={handleEmailLookup}
                loading={emailLookupLoading}
                error={emailLookupError}
              />
            </Card>
          </motion.div>
        )}

        {pageState.phase === "not-found" && (
          <motion.div key="not-found" {...motionProps}>
            <Card padding="lg" className="space-y-4 text-center">
              <h1 className="font-serif text-2xl text-text-primary">
                Report not found
              </h1>
              <p className="text-text-secondary">
                We couldn&apos;t find a report for this scan. If you&apos;ve
                just purchased, it may take a moment to appear.
              </p>
              <Button
                variant="secondary"
                onClick={() => setPageState({ phase: "lookup" })}
              >
                Try a different email
              </Button>
            </Card>
          </motion.div>
        )}

        {pageState.phase === "error" && (
          <motion.div key="error" {...motionProps}>
            <Card padding="lg" className="space-y-4 text-center">
              <h1 className="font-serif text-2xl text-text-primary">
                Something went wrong
              </h1>
              <p className="text-text-secondary">
                {pageState.message}
              </p>
              <Button
                variant="secondary"
                onClick={() =>
                  sessionId
                    ? setPageState({ phase: "loading" })
                    : setPageState({ phase: "lookup" })
                }
              >
                Try again
              </Button>
            </Card>
          </motion.div>
        )}

        {pageState.phase === "found" && (
          <motion.div key={`found-${pageState.report.status}`} {...motionProps}>
            <Card padding="lg">
              <StatusDisplay
                report={pageState.report}
                onRegenerate={handleRegenerate}
                regenerating={regenerating}
              />
            </Card>

            {ACTIVE_STATUSES.has(pageState.report.status) && (
              <motion.p
                className="mt-4 text-center text-xs text-text-tertiary"
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Refreshing automatically every 10 seconds&hellip;
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
