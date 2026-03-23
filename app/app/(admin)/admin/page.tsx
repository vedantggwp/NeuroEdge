import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = createServerClient();

  const [
    { count: totalScans },
    { count: totalReports },
    { data: failedReports },
    { data: recentScans },
  ] = await Promise.all([
    db.from("scans").select("*", { count: "exact", head: true }),
    db.from("reports").select("*", { count: "exact", head: true }),
    db.from("reports").select("id, scan_id, email, status, error_message, created_at").eq("status", "failed").order("created_at", { ascending: false }).limit(10),
    db.from("scans").select("id, url, score, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Scans" value={totalScans ?? 0} />
        <StatCard label="Total Reports" value={totalReports ?? 0} />
        <StatCard label="Failed Reports" value={failedReports?.length ?? 0} accent={true} />
        <StatCard label="Scan Service" value="Check UptimeRobot" />
      </div>

      {failedReports && failedReports.length > 0 ? (
        <section>
          <h2 className="text-lg font-bold mb-4 text-severity-critical">Failed Reports</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg-surface text-text-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Error</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {failedReports.map((r: Record<string, unknown>) => (
                  <tr key={String(r.id)} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary">{String(r.email)}</td>
                    <td className="px-4 py-3 text-text-secondary">{String(r.error_message ?? "Unknown")}</td>
                    <td className="px-4 py-3 text-text-tertiary">{new Date(String(r.created_at)).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-bold mb-4">Recent Scans</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface text-text-secondary">
              <tr>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentScans ?? []).map((s: Record<string, unknown>) => (
                <tr key={String(s.id)} className="border-t border-border">
                  <td className="px-4 py-3 text-accent">{String(s.url)}</td>
                  <td className="px-4 py-3 font-mono text-text-primary">{String(s.score)}/100</td>
                  <td className="px-4 py-3 text-text-tertiary">{new Date(String(s.created_at)).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ? "text-severity-critical" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
