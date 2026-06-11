import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Report-status lookup. Replaces the previous direct anon-key reads of the
 * `reports` table (which holds customer emails). RLS now denies anon all
 * access, so this server-side route uses the service-role client and returns
 * only a single report the caller can already identify — by reportId, by
 * (scanId + Stripe sessionId), or by (scanId + email). Rate-limited because the
 * email path is an enumeration vector.
 */
interface ReportStatusBody {
  scanId?: string;
  sessionId?: string;
  email?: string;
  reportId?: string;
}

const REPORT_COLUMNS = "id, scan_id, email, status, sent_at, created_at";

export async function POST(req: Request) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`report-status:${clientIp}`, 30, 60_000).allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let body: ReportStatusBody;
  try {
    body = (await req.json()) as ReportStatusBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = createServerClient();
  const base = db.from("reports").select(REPORT_COLUMNS);

  let result;
  if (typeof body.reportId === "string" && body.reportId) {
    result = await base.eq("id", body.reportId).single();
  } else if (
    typeof body.scanId === "string" &&
    body.scanId &&
    typeof body.sessionId === "string" &&
    body.sessionId
  ) {
    result = await base
      .eq("scan_id", body.scanId)
      .eq("stripe_session_id", body.sessionId)
      .single();
  } else if (
    typeof body.scanId === "string" &&
    body.scanId &&
    typeof body.email === "string" &&
    body.email
  ) {
    result = await base
      .eq("scan_id", body.scanId)
      .eq("email", body.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
  } else {
    return NextResponse.json(
      { error: "Provide reportId, or scanId together with sessionId or email" },
      { status: 400 },
    );
  }

  if (result.error || !result.data) {
    // Not found yet (e.g. webhook still processing) — not an error to the poller.
    return NextResponse.json({ report: null });
  }

  return NextResponse.json({ report: result.data });
}
