ALTER TABLE mistake_log
ADD COLUMN mistake_reason text CHECK (mistake_reason IN ('Conceptual Gap', 'Calculation Error', 'Time Pressure', 'Silly Mistake', 'Guessed'));

CREATE TABLE shortcuts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id),
  title text NOT NULL,
  formula text NOT NULL,
  description text,
  example_question text,
  created_at timestamp with time zone DEFAULT now()
);
