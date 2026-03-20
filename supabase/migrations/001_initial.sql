-- 001_initial.sql
-- Initial schema for NeuroEdge accessibility audit platform

create table scans (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  score integer,
  total_violations integer,
  violations jsonb,
  top_issues jsonb,
  industry text,
  estimated_traffic integer,
  avg_order_value numeric(10,2),
  revenue_uplift_low numeric(10,2),
  revenue_uplift_high numeric(10,2),
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) not null,
  email text not null,
  stripe_session_id text,
  stripe_payment_intent text,
  coupon_code text,
  status text not null default 'pending',
  pdf_url text,
  plain_english_violations jsonb,
  created_at timestamptz default now(),
  sent_at timestamptz
);

create table coupons (
  code text primary key,
  discount_percent integer not null default 100,
  max_uses integer,
  current_uses integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create index idx_reports_email on reports(email);
create index idx_reports_stripe_session on reports(stripe_session_id);

create or replace function increment_coupon_usage(coupon_code text)
returns void as $$
begin
  update coupons
  set current_uses = current_uses + 1
  where code = coupon_code and active = true;
end;
$$ language plpgsql;
