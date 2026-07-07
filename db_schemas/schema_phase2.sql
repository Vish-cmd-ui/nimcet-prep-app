-- Phase 2 Schema: Questions Table

CREATE TABLE questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid REFERENCES topics(id),
  question_text text NOT NULL,
  options jsonb,          -- ["A...", "B...", "C...", "D..."]
  correct_option text,
  explanation text,
  difficulty text,         -- easy | medium | hard
  source text,             -- 'pyq' | 'generated'
  pyq_year int,            -- null if generated
  created_at timestamp DEFAULT now()
);
