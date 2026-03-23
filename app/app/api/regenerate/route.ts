import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

interface RegenerateRequestBody {
  reportId?: string;
  scanId?: string;
}

export async function POST(req: NextRequest) {
  let body: RegenerateRequestBody;
  try {
    body = (await req.json()) as RegenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { reportId, scanId } = body;

  if (!reportId || typeof reportId !== "string") {
    return NextResponse.json({ error: "reportId is required" }, { status: 400 });
  }
  if (!scanId || typeof scanId !== "string") {
    return NextResponse.json({ error: "scanId is required" }, { status: 400 });
  }

  const db = createServerClient();

  // Verify the report exists and belongs to this scan
  const { data: report, error: fetchError } = await db
    .from("reports")
    .select("id, scan_id, status")
    .eq("id", reportId)
    .eq("scan_id", scanId)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Reset status to pending so the status page reflects activity
  const { error: updateError } = await db
    .from("reports")
    .update({ status: "pending" })
    .eq("id", reportId);

  if (updateError) {
    console.error("Failed to reset report status:", updateError);
    return NextResponse.json(
      { error: "Failed to reset report status" },
      { status: 500 },
    );
  }

  // Forward to the scan service
  const scanServiceUrl = process.env.SCAN_SERVICE_URL;
  if (!scanServiceUrl) {
    console.warn("SCAN_SERVICE_URL is not set — skipping report generation trigger");
    return NextResponse.json({ queued: true, triggered: false });
  }

  try {
    const res = await fetch(`${scanServiceUrl}/api/generate-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SCAN_SERVICE_API_KEY ?? "",
      },
      body: JSON.stringify({ reportId, scanId }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `Scan service responded ${res.status} on regenerate:`,
        text,
      );
      return NextResponse.json(
        { error: "Report service failed to start generation" },
        { status: 502 },
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to reach scan service:", message);
    return NextResponse.json(
      { error: "Could not reach report service" },
      { status: 502 },
    );
  }

  return NextResponse.json({ queued: true, triggered: true });
}
