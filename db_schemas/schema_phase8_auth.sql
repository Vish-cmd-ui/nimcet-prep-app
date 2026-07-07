-- Phase 8: Authentication & Multi-Tenancy

-- 1. Wipe existing anonymous data so we can enforce NOT NULL on user_id
TRUNCATE TABLE attempts CASCADE;
TRUNCATE TABLE tests CASCADE;
TRUNCATE TABLE daily_attendance CASCADE;
TRUNCATE TABLE roadmap CASCADE;
TRUNCATE TABLE study_log CASCADE;
TRUNCATE TABLE mistake_log CASCADE;

-- 2. Add user_id column to tables and make it required
ALTER TABLE tests ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;
ALTER TABLE attempts ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;
ALTER TABLE daily_attendance ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;
ALTER TABLE roadmap ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;
ALTER TABLE study_log ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;
ALTER TABLE mistake_log ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_log ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Tests
CREATE POLICY "Users can manage their own tests"
ON tests FOR ALL USING (auth.uid() = user_id);

-- Attempts
CREATE POLICY "Users can manage their own attempts"
ON attempts FOR ALL USING (auth.uid() = user_id);

-- Daily Attendance
CREATE POLICY "Users can manage their own attendance"
ON daily_attendance FOR ALL USING (auth.uid() = user_id);

-- Roadmap
CREATE POLICY "Users can manage their own roadmap"
ON roadmap FOR ALL USING (auth.uid() = user_id);

-- Study Log
CREATE POLICY "Users can manage their own study_log"
ON study_log FOR ALL USING (auth.uid() = user_id);

-- Mistake Log
CREATE POLICY "Users can manage their own mistake_log"
ON mistake_log FOR ALL USING (auth.uid() = user_id);

-- Note: `questions` and `topics` remain global (public read). We will enable RLS and make them public read.
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are readable by everyone" ON questions FOR SELECT USING (true);
-- Only service role can insert/update/delete questions (handled automatically by Supabase Service Role key)

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Topics are readable by everyone" ON topics FOR SELECT USING (true);
