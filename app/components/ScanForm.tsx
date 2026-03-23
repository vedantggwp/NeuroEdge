"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { URL_PATTERN } from "@/lib/constants";

function normaliseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(undefined);

      const trimmed = url.trim();
      if (!trimmed) {
        setError("Please enter a website URL.");
        return;
      }
      if (!URL_PATTERN.test(trimmed)) {
        setError(
          "That doesn't look like a valid URL. Try something like example.co.uk",
        );
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normaliseUrl(trimmed) }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? `Scan failed (${res.status}). Please try again.`,
          );
        }

        const { id } = await res.json();
        router.push(`/scan/${id}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
        setLoading(false);
      }
    },
    [url, router],
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className={[
          "flex items-center w-full rounded-full border p-[5px] transition-all duration-300",
          "bg-white border-border",
          "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
          "max-sm:flex-col max-sm:rounded-3xl max-sm:p-1",
        ].join(" ")}
      >
        <input
          type="url"
          inputMode="url"
          placeholder="Enter your website URL"
          aria-label="Website URL to scan"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(undefined);
          }}
          autoComplete="url"
          className="flex-1 bg-transparent border-none outline-none px-6 py-3.5 text-[0.9375rem] text-text-primary font-medium placeholder:text-text-tertiary max-sm:w-full max-sm:text-center max-sm:px-4"
        />
        <button
          type="submit"
          disabled={loading}
          className={[
            "inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-white text-sm font-bold rounded-full cursor-pointer whitespace-nowrap flex-shrink-0",
            "hover:bg-accent-hover active:scale-[0.97] transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "max-sm:w-full max-sm:justify-center max-sm:rounded-xl",
          ].join(" ")}
        >
          {loading ? (
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
              role="status"
              aria-label="Scanning"
            />
          ) : null}
          {loading ? "Scanning..." : "Check My Website Free"}
          {!loading ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 8h10" />
              <path d="M9 4l4 4-4 4" />
            </svg>
          ) : null}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-severity-critical text-center">
          {error}
        </p>
      ) : null}
    </form>
  );
}
