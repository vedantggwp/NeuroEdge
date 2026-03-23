import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminCoupons() {
  const db = createServerClient();

  const { data: coupons } = await db
    .from("coupons")
    .select("id, code, discount_percent, current_uses, max_uses, active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Coupons</h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Uses</th>
              <th className="px-4 py-3 text-left">Max Uses</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {(coupons ?? []).map((c: Record<string, unknown>) => (
              <tr key={String(c.id)} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-accent">{String(c.code)}</td>
                <td className="px-4 py-3 text-text-primary">{String(c.discount_percent)}%</td>
                <td className="px-4 py-3 text-text-primary tabular-nums">{String(c.current_uses ?? 0)}</td>
                <td className="px-4 py-3 text-text-secondary tabular-nums">{c.max_uses ? String(c.max_uses) : "Unlimited"}</td>
                <td className="px-4 py-3">
                  <ActiveBadge active={Boolean(c.active)} />
                </td>
                <td className="px-4 py-3 text-text-tertiary">{new Date(String(c.created_at)).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!coupons || coupons.length === 0) ? (
        <p className="text-text-tertiary text-sm">No coupons found.</p>
      ) : null}
    </div>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? "bg-accent-subtle text-accent" : "bg-bg-surface text-text-tertiary"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
