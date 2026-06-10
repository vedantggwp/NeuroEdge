import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * Public scan-results read. Uses the service-role client because RLS now denies
 * the anon role all table access (see migration 003). Returns only the
 * non-sensitive fields the results page needs.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Scan id is required" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("scans")
    .select("id, url, score, total_violations, top_issues, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
