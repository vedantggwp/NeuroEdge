import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

const SCAN_SERVICE_URL = process.env.SCAN_SERVICE_URL ?? "";
const SCAN_TIMEOUT_MS = 60_000;

export async function POST(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = checkRateLimit(clientIp, 5, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { url } = body as { url?: string };

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 },
    );
  }

  if (!SCAN_SERVICE_URL) {
    return NextResponse.json(
      { error: "Scan service is not configured" },
      { status: 503 },
    );
  }

  /* Forward scan request to VPS with timeout + API key */
  let scanResponse: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);

    scanResponse = await fetch(`${SCAN_SERVICE_URL}/api/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SCAN_SERVICE_API_KEY ?? "",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch (err) {
    const message = err instanceof Error && err.name === "AbortError"
      ? "Scan timed out. The site may be too large or slow to respond."
      : "Could not reach scan service. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: 502 },
    );
  }

  if (!scanResponse.ok) {
    const err = await scanResponse.json().catch(() => ({
      error: `Scan failed (${scanResponse.status})`,
    }));
    return NextResponse.json(err, { status: scanResponse.status });
  }

  const result = await scanResponse.json();

  /* Persist to Supabase */
  const db = createServerClient();
  const { data: scan, error: insertError } = await db
    .from("scans")
    .insert({
      url,
      score: result.score,
      total_violations: result.totalViolations,
      violations: result.violations,
      top_issues: result.violations?.slice(0, 5) ?? [],
      passed_rules: result.passedRules ?? 0,
      total_rules: result.totalRules ?? 0,
    })
    .select("id")
    .single();

  if (insertError || !scan) {
    console.error("Failed to store scan:", insertError);
    return NextResponse.json(
      { error: "Failed to save scan results" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: scan.id,
    score: result.score,
    totalViolations: result.totalViolations,
    violations: result.violations,
  });
}
