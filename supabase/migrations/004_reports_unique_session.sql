-- 004_reports_unique_session.sql
-- Apply to live DB (Supabase) — required for webhook idempotency.
--
-- Stripe delivers webhooks at-least-once: a `checkout.session.completed` event
-- can be retried. Without a uniqueness guarantee on `reports.stripe_session_id`,
-- each retry inserts a duplicate report row AND re-runs `increment_coupon_usage`,
-- pushing a coupon past its `max_uses` and triggering duplicate report generation.
--
-- This adds a UNIQUE constraint so the second insert for the same Stripe session
-- fails with SQLSTATE 23505, which the webhook handler treats as "already
-- processed" (returns 200, no increment, no regeneration).
--
-- Postgres treats NULLs as DISTINCT in a UNIQUE constraint, so the 100%-off
-- flow (which inserts reports with stripe_session_id = NULL and increments in
-- the checkout route instead of the webhook) is unaffected — any number of
-- NULL-session rows remain allowed.
--
-- The reports table is currently empty, so this applies cleanly with no
-- pre-existing duplicates to resolve.

-- Drop the existing non-unique index; the UNIQUE constraint below creates its
-- own backing unique index, making the old one redundant.
drop index if exists idx_reports_stripe_session;

alter table reports
  add constraint reports_stripe_session_id_key unique (stripe_session_id);
