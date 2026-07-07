-- Phase 5 Schema: Attempts, Mistakes, Analytics

CREATE TABLE attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid REFERENCES questions(id),
  test_id uuid REFERENCES tests(id),       -- null if standalone practice
  is_correct boolean NOT NULL,
  time_taken_seconds int,
  attempted_at timestamp DEFAULT now()
);

CREATE TABLE mistake_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid REFERENCES questions(id),
  topic_id uuid REFERENCES topics(id),
  times_wrong int DEFAULT 1,
  next_review_date date NOT NULL,          -- for spaced repetition scheduling
  resolved boolean DEFAULT false,
  updated_at timestamp DEFAULT now()
);

-- Trigger to auto-update updated_at can be added, but omitted for simplicity
