CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

INSERT INTO storage.buckets (id, name, public)
VALUES ('alif-images', 'alif-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images" ON storage.objects
FOR SELECT USING (bucket_id = 'alif-images');

DROP POLICY IF EXISTS "Admin upload images" ON storage.objects;
CREATE POLICY "Admin upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'alif-images'
  AND (auth.jwt() ->> 'email') = 'alifbrur16@gmail.com'
);

DROP POLICY IF EXISTS "Admin delete images" ON storage.objects;
CREATE POLICY "Admin delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'alif-images'
  AND (auth.jwt() ->> 'email') = 'alifbrur16@gmail.com'
);

CREATE TABLE IF NOT EXISTS portfolio_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL DEFAULT 'main' UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  handle TEXT NOT NULL DEFAULT '' UNIQUE,
  role TEXT NOT NULL DEFAULT '',
  headline TEXT DEFAULT '',
  value TEXT DEFAULT '',
  email TEXT DEFAULT '',
  location TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_socials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES portfolio_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_socials_profile_platform_key UNIQUE (profile_id, platform)
);

CREATE TABLE IF NOT EXISTS portfolio_nav_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL DEFAULT '#' UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_hero (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL DEFAULT 'main' UNIQUE,
  headline TEXT NOT NULL DEFAULT '',
  value TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_hero_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_id UUID NOT NULL REFERENCES portfolio_hero(id) ON DELETE CASCADE,
  value TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_hero_highlights_hero_sort_key UNIQUE (hero_id, sort_order)
);

CREATE TABLE IF NOT EXISTS portfolio_about_paragraphs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0 UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  github TEXT DEFAULT '',
  demo TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  show_github BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_project_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES portfolio_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_project_tags_project_tag_key UNIQUE (project_id, tag_id)
);

CREATE TABLE IF NOT EXISTS portfolio_project_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL UNIQUE REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  slug TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  full_description TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  demo_url TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  status TEXT DEFAULT 'Planned',
  featured BOOLEAN DEFAULT false,
  show_database BOOLEAN DEFAULT false,
  show_github BOOLEAN DEFAULT true,
  show_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_detail_technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detail_id UUID NOT NULL REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_detail_technologies_detail_sort_key UNIQUE (detail_id, sort_order)
);

CREATE TABLE IF NOT EXISTS portfolio_detail_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detail_id UUID NOT NULL REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_detail_features_detail_sort_key UNIQUE (detail_id, sort_order)
);

CREATE TABLE IF NOT EXISTS portfolio_detail_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detail_id UUID NOT NULL REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_detail_gallery_detail_sort_key UNIQUE (detail_id, sort_order)
);

CREATE TABLE IF NOT EXISTS portfolio_detail_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detail_id UUID NOT NULL REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  date TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  detail TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_detail_timeline_detail_sort_key UNIQUE (detail_id, sort_order)
);

CREATE TABLE IF NOT EXISTS portfolio_detail_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detail_id UUID NOT NULL REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_detail_challenges_detail_sort_key UNIQUE (detail_id, sort_order)
);

CREATE TABLE IF NOT EXISTS portfolio_detail_solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detail_id UUID NOT NULL REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_detail_solutions_detail_sort_key UNIQUE (detail_id, sort_order)
);

CREATE TABLE IF NOT EXISTS portfolio_detail_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detail_id UUID NOT NULL REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_detail_statistics_detail_label_key UNIQUE (detail_id, label)
);

CREATE TABLE IF NOT EXISTS portfolio_detail_database (
  detail_id UUID PRIMARY KEY REFERENCES portfolio_project_details(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',
  "group" TEXT DEFAULT 'Other',
  level INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_skills_name_group_key UNIQUE (name, "group")
);

CREATE TABLE IF NOT EXISTS portfolio_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  degree TEXT NOT NULL,
  institute TEXT DEFAULT '',
  district TEXT DEFAULT '',
  class TEXT DEFAULT '',
  year TEXT DEFAULT '',
  description TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_education_degree_institute_key UNIQUE (degree, institute)
);

CREATE TABLE IF NOT EXISTS portfolio_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  company TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_experience_role_company_key UNIQUE (role, company)
);

CREATE TABLE IF NOT EXISTS portfolio_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'code',
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image TEXT DEFAULT '',
  comment TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_journey (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_journey_label_title_key UNIQUE (label, title)
);

CREATE TABLE IF NOT EXISTS portfolio_awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT DEFAULT '',
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  date TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT portfolio_awards_title_issuer_key UNIQUE (title, issuer)
);

CREATE INDEX IF NOT EXISTS portfolio_socials_profile_idx ON portfolio_socials(profile_id);
CREATE INDEX IF NOT EXISTS portfolio_hero_highlights_hero_idx ON portfolio_hero_highlights(hero_id);
CREATE INDEX IF NOT EXISTS portfolio_project_tags_project_idx ON portfolio_project_tags(project_id);
CREATE INDEX IF NOT EXISTS portfolio_project_tags_tag_idx ON portfolio_project_tags(tag_id);
CREATE INDEX IF NOT EXISTS portfolio_detail_technologies_detail_idx ON portfolio_detail_technologies(detail_id);
CREATE INDEX IF NOT EXISTS portfolio_detail_features_detail_idx ON portfolio_detail_features(detail_id);
CREATE INDEX IF NOT EXISTS portfolio_detail_gallery_detail_idx ON portfolio_detail_gallery(detail_id);
CREATE INDEX IF NOT EXISTS portfolio_detail_timeline_detail_idx ON portfolio_detail_timeline(detail_id);
CREATE INDEX IF NOT EXISTS portfolio_detail_challenges_detail_idx ON portfolio_detail_challenges(detail_id);
CREATE INDEX IF NOT EXISTS portfolio_detail_solutions_detail_idx ON portfolio_detail_solutions(detail_id);
CREATE INDEX IF NOT EXISTS portfolio_detail_statistics_detail_idx ON portfolio_detail_statistics(detail_id);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'portfolio_profiles','portfolio_socials','portfolio_nav_items',
    'portfolio_hero','portfolio_hero_highlights','portfolio_about_paragraphs',
    'portfolio_tags','portfolio_projects','portfolio_project_tags',
    'portfolio_project_details','portfolio_detail_technologies','portfolio_detail_features',
    'portfolio_detail_gallery','portfolio_detail_timeline','portfolio_detail_challenges',
    'portfolio_detail_solutions','portfolio_detail_statistics','portfolio_detail_database',
    'portfolio_skills','portfolio_tools','portfolio_education','portfolio_experience',
    'portfolio_services','portfolio_reviews','portfolio_journey','portfolio_awards'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS touch_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER touch_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t);
  END LOOP;
END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'portfolio_profiles','portfolio_socials','portfolio_nav_items',
    'portfolio_hero','portfolio_hero_highlights','portfolio_about_paragraphs',
    'portfolio_tags','portfolio_projects','portfolio_project_tags',
    'portfolio_project_details','portfolio_detail_technologies','portfolio_detail_features',
    'portfolio_detail_gallery','portfolio_detail_timeline','portfolio_detail_challenges',
    'portfolio_detail_solutions','portfolio_detail_statistics','portfolio_detail_database',
    'portfolio_skills','portfolio_tools','portfolio_education','portfolio_experience',
    'portfolio_services','portfolio_reviews','portfolio_journey','portfolio_awards'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public read" ON %I', t);
    EXECUTE format('CREATE POLICY "Public read" ON %I FOR SELECT USING (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin write" ON %I', t);
    EXECUTE format('CREATE POLICY "Admin write" ON %I FOR ALL USING ((auth.jwt() ->> ''email'') = ''alifbrur16@gmail.com'') WITH CHECK ((auth.jwt() ->> ''email'') = ''alifbrur16@gmail.com'')', t);
  END LOOP;
END $$;
