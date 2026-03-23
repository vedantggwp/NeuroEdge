"use client";

import { useState } from "react";

export function RetryButton({ reportId, scanId }: { reportId: string; scanId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleRetry() {
    setState("loading");
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, scanId }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <span className="text-xs text-accent">Queued</span>;
  }

  if (state === "error") {
    return <span className="text-xs text-severity-critical">Failed</span>;
  }

  return (
    <button
      type="button"
      onClick={handleRetry}
      disabled={state === "loading"}
      className="rounded-lg border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors disabled:opacity-50"
    >
      {state === "loading" ? "Retrying..." : "Retry"}
    </button>
  );
}
