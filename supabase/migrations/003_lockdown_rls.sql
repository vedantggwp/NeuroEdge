-- 003_lockdown_rls.sql
-- SECURITY (launch-blocker): the live DB had RLS DISABLED and the public anon
-- role held full CRUD (SELECT/INSERT/UPDATE/DELETE/TRUNCATE) on every table.
-- Migration 002 (which would have enabled RLS) was never applied. This locks
-- the database down: revoke the blanket public grants, enable RLS, and route
-- ALL reads/writes through the service role (which bypasses RLS) via the app's
-- server-side API routes. After this, the anon key can do nothing to these
-- tables.
--
-- NOTE: enabling RLS alone does NOT stop TRUNCATE (it is outside RLS), which is
-- why the explicit REVOKE below is required, not optional.

-- 1. Strip the over-broad default grants from the public roles.
revoke all privileges on public.scans   from anon, authenticated;
revoke all privileges on public.reports from anon, authenticated;
revoke all privileges on public.coupons from anon, authenticated;

-- 2. Enable row level security on all public tables.
alter table public.scans   enable row level security;
alter table public.reports enable row level security;
alter table public.coupons enable row level security;

-- 3. No anon/authenticated policies are created: with RLS on and no permissive
--    policy, the public roles are fully denied. The service role bypasses RLS,
--    so all server-side API routes continue to work unchanged.

-- 4. Harden increment_coupon_usage: pin search_path and fully-qualify the table
--    (Supabase advisor 0011 — function_search_path_mutable).
create or replace function public.increment_coupon_usage(coupon_code text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.coupons
  set current_uses = current_uses + 1
  where code = coupon_code and active = true;
end;
$$;
