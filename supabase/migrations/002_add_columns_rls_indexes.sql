-- 002_add_columns_rls_indexes.sql
-- RUN THIS IN SUPABASE DASHBOARD > SQL EDITOR
-- Project: jlxyhxbcdvaryhusteku
-- After running, verify with: SELECT column_name FROM information_schema.columns WHERE table_name = 'reports';

-- Missing columns on reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS industry text;

-- Missing columns on scans
ALTER TABLE scans ADD COLUMN IF NOT EXISTS passed_rules integer;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS total_rules integer;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS revenue_estimate jsonb;

-- Enable RLS on all tables
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Scans: anon can SELECT (IDs are UUIDs, unguessable), service_role has full access
CREATE POLICY "anon_read_scans" ON scans FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_scans" ON scans FOR ALL TO service_role USING (true);

-- Reports: anon can SELECT (looked up by ID or email), service_role has full access
CREATE POLICY "anon_read_reports" ON reports FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_reports" ON reports FOR ALL TO service_role USING (true);

-- Coupons: anon can only read active coupons, service_role manages
CREATE POLICY "anon_read_active_coupons" ON coupons FOR SELECT TO anon USING (active = true);
CREATE POLICY "service_all_coupons" ON coupons FOR ALL TO service_role USING (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_reports_scan_email ON reports(scan_id, email);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
