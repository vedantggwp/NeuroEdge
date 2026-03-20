"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
        setError("That doesn't look like a valid URL. Try something like example.co.uk");
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
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        );
        setLoading(false);
      }
    },
    [url, router],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-start"
      noValidate
    >
      <div className="flex-1">
        <Input
          id="scan-url"
          type="url"
          inputMode="url"
          placeholder="yourwebsite.co.uk"
          aria-label="Website URL to scan"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
          autoComplete="url"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        loading={loading}
        className="shrink-0 whitespace-nowrap sm:mt-0"
      >
        Scan Free
        {!loading ? (
          <span aria-hidden="true" className="ml-1">
            &rarr;
          </span>
        ) : null}
      </Button>
    </form>
  );
}
