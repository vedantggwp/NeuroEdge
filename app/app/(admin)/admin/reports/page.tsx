import { createServerClient } from "@/lib/supabase";
import { RetryButton } from "./RetryButton";

export const dynamic = "force-dynamic";

export default async function AdminReports() {
  const db = createServerClient();

  const { data: reports } = await db
    .from("reports")
    .select("id, scan_id, email, status, error_message, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // Collect unique scan IDs to fetch URLs
  const scanIds = [...new Set((reports ?? []).map((r: Record<string, unknown>) => String(r.scan_id)))];
  const { data: scans } = scanIds.length > 0
    ? await db.from("scans").select("id, url").in("id", scanIds)
    : { data: [] };

  const scanUrlMap = new Map<string, string>();
  for (const s of scans ?? []) {
    scanUrlMap.set(String((s as Record<string, unknown>).id), String((s as Record<string, unknown>).url));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Scan URL</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(reports ?? []).map((r: Record<string, unknown>) => {
              const status = String(r.status);
              const scanUrl = scanUrlMap.get(String(r.scan_id)) ?? "—";
              const isFailed = status === "failed";

              return (
                <tr key={String(r.id)} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{String(r.email)}</td>
                  <td className="px-4 py-3 text-accent max-w-[200px] truncate" title={scanUrl}>{scanUrl}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 text-text-tertiary">{new Date(String(r.created_at)).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 text-text-tertiary">
                    {r.updated_at ? new Date(String(r.updated_at)).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isFailed ? (
                      <RetryButton reportId={String(r.id)} scanId={String(r.scan_id)} />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(!reports || reports.length === 0) ? (
        <p className="text-text-tertiary text-sm">No reports found.</p>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-accent-subtle text-accent",
    pending: "bg-bg-surface text-text-secondary",
    failed: "bg-severity-critical-bg text-severity-critical",
    processing: "bg-severity-serious-bg text-severity-serious",
  };

  const cls = colors[status] ?? "bg-bg-surface text-text-tertiary";

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

