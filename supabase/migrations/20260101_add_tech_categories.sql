-- Technology Stack categories: one global list, referenced by UUID.
--
-- Categories are NOT per project. They live in their own table so the admin can
-- create, rename, reorder and delete them from a dedicated "Tech Categories"
-- section, and every technology across every project points at one of those
-- rows through portfolio_detail_technologies.category_id.
--
-- Safe to run more than once.
--
--   1. Drop the earlier per-project design, if it was ever applied.
--   2. Create the global categories table.
--   3. category_id UUID FK on technologies. ON DELETE SET NULL, not CASCADE:
--      categories are shared across projects, so deleting one must not wipe
--      technologies out of every project that used it. They simply fall back
--      to the uncategorised group and stay visible.
--   4. Order is per (project, category), so two projects can both hold a
--      technology at sort_order 0 inside the same category.

-- 1. Clean up the superseded per-project design ------------------------------
-- The column MUST go first: it carries an FK constraint pointing at the old
-- table, and Postgres refuses to drop a table that something still depends on.
ALTER TABLE portfolio_detail_technologies DROP COLUMN IF EXISTS category_id;
DROP INDEX IF EXISTS portfolio_detail_technologies_category_idx;
DROP INDEX IF EXISTS portfolio_detail_technologies_category_sort_key;
DROP INDEX IF EXISTS portfolio_detail_technologies_detail_category_sort_key;
DROP TABLE IF EXISTS portfolio_project_tech_categories;

-- 2. Global categories --------------------------------------------------------
-- No UNIQUE on sort_order: the admin types sort_order by hand, so two rows
-- saved at the default 0 must not be rejected. Ties just sort arbitrarily.
CREATE TABLE IF NOT EXISTS portfolio_tech_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. UUID link on technologies -------------------------------------------------
ALTER TABLE portfolio_detail_technologies
  ADD COLUMN IF NOT EXISTS category_id UUID
  REFERENCES portfolio_tech_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS portfolio_detail_technologies_category_idx
  ON portfolio_detail_technologies(category_id);

-- 4. Ordering uniqueness -------------------------------------------------------
-- The old UNIQUE(detail_id, sort_order) cannot survive grouping: two categories
-- would both hold a technology at sort_order 0 and collide.
ALTER TABLE portfolio_detail_technologies
  DROP CONSTRAINT IF EXISTS portfolio_detail_technologies_detail_sort_key;

CREATE UNIQUE INDEX IF NOT EXISTS portfolio_detail_technologies_detail_category_sort_key
  ON portfolio_detail_technologies(detail_id, category_id, sort_order)
  WHERE category_id IS NOT NULL;

-- Keep updated_at fresh, matching the convention the other tables use.
DROP TRIGGER IF EXISTS touch_updated_at ON portfolio_tech_categories;
CREATE TRIGGER touch_updated_at
  BEFORE UPDATE ON portfolio_tech_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS. This is what the other portfolio_* tables already use (see the DO
-- block at the bottom of supabase/schema.sql): anyone may read, and only the
-- signed-in admin account may write. Without these the admin gets
-- "new row violates row-level security policy" on every insert.
ALTER TABLE portfolio_tech_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON portfolio_tech_categories;
CREATE POLICY "Public read" ON portfolio_tech_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write" ON portfolio_tech_categories;
CREATE POLICY "Admin write" ON portfolio_tech_categories
  FOR ALL
  USING ((auth.jwt() ->> 'email') = 'alifbrur16@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'alifbrur16@gmail.com');

-- Verification ---------------------------------------------------------------
-- categories: 0 rows right now (admin creates them from the new section)
-- uncategorised: 40, total: 40 -> every existing technology keeps rendering,
-- just under the uncategorised group until it is filed.
SELECT (SELECT count(*) FROM portfolio_tech_categories) AS categories,
       count(*) FILTER (WHERE category_id IS NULL) AS uncategorised,
       count(*) AS total
FROM portfolio_detail_technologies;