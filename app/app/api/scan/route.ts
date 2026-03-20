import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const SCAN_SERVICE_URL = process.env.SCAN_SERVICE_URL ?? "";

export async function POST(req: Request) {
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

  /* Forward scan request to VPS */
  let scanResponse: Response;
  try {
    scanResponse = await fetch(`${SCAN_SERVICE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach scan service. Please try again." },
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
