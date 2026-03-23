import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const COOKIE_NAME = "neuroedge-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!ADMIN_PASSWORD) {
    return <div className="p-8 text-text-primary">Admin not configured. Set ADMIN_PASSWORD env var.</div>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token !== ADMIN_PASSWORD) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <span className="font-extrabold">Neuro<span className="text-accent">Edge</span> Admin</span>
          <div className="flex gap-6 text-sm">
            <a href="/admin" className="text-text-secondary hover:text-text-primary transition-colors">Dashboard</a>
            <a href="/admin/reports" className="text-text-secondary hover:text-text-primary transition-colors">Reports</a>
            <a href="/admin/coupons" className="text-text-secondary hover:text-text-primary transition-colors">Coupons</a>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <form action="/api/admin-login" method="POST" className="w-80 space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Admin Login</h1>
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-border bg-bg-surface px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
        <button type="submit" className="w-full rounded-xl bg-accent py-3 font-bold text-text-inverse">
          Log in
        </button>
      </form>
    </div>
  );
}
