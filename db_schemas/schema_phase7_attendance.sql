-- Phase 7 Schema: DPP Gamification & Attendance

CREATE TABLE daily_attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,       -- Only one attendance record per day
  test_id uuid REFERENCES tests(id),
  score numeric,
  max_score numeric,
  completed_at timestamp DEFAULT now()
);
