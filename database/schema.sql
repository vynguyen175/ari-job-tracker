CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved',
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT,
  work_mode TEXT,
  tech_stack TEXT[],
  url TEXT,
  notes TEXT,
  date_applied DATE,
  contact_person TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON job_applications(status);
CREATE INDEX IF NOT EXISTS job_applications_created_at_idx ON job_applications(created_at DESC);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_applications_rls_select ON job_applications;
CREATE POLICY job_applications_rls_select ON job_applications FOR SELECT
  USING (user_id::text = (SELECT current_setting('app.current_user_id')));

DROP POLICY IF EXISTS job_applications_rls_insert ON job_applications;
CREATE POLICY job_applications_rls_insert ON job_applications FOR INSERT
  WITH CHECK (user_id::text = (SELECT current_setting('app.current_user_id')));

DROP POLICY IF EXISTS job_applications_rls_update ON job_applications;
CREATE POLICY job_applications_rls_update ON job_applications FOR UPDATE
  USING (user_id::text = (SELECT current_setting('app.current_user_id')));

DROP POLICY IF EXISTS job_applications_rls_delete ON job_applications;
CREATE POLICY job_applications_rls_delete ON job_applications FOR DELETE
  USING (user_id::text = (SELECT current_setting('app.current_user_id')));
