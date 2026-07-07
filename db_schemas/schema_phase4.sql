-- Phase 4 Schema: Study Log and Tests

CREATE TABLE study_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  topic_id uuid REFERENCES topics(id),
  status text,              -- 'learned' | 'revised'
  notes text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE tests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,       -- 'dpp' | 'weekly' | 'monthly' | 'mock'
  date date NOT NULL,
  question_ids uuid[] NOT NULL,
  score numeric,
  max_score numeric,
  created_at timestamp DEFAULT now()
);

-- We also need a way to link questions generated to the test if we store them permanently
-- The questions table already has 'source' = 'generated' and topic_id.
