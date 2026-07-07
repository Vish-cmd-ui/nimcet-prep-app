-- Phase 1 Schema: Topics and Roadmap

CREATE TABLE topics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,        -- Mathematics | Reasoning | Computer Awareness | English
  chapter text NOT NULL,        
  subtopic text NOT NULL,       
  weight_hint int               -- relative importance
);

CREATE TABLE roadmap (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number int NOT NULL,
  start_date date,
  end_date date,
  topic_ids uuid[],
  status text DEFAULT 'pending' -- pending | in_progress | completed
);

-- Seed topics
INSERT INTO topics (subject, chapter, subtopic, weight_hint) VALUES
-- Mathematics (60% weight)
('Mathematics', 'Set Theory and Logic', 'Sets, Operations, Cartesian Product, Cardinality', 5),
('Mathematics', 'Set Theory and Logic', 'Functions and Relations', 5),
('Mathematics', 'Set Theory and Logic', 'Venn Diagrams, Truth tables, Tautology/Contradictions', 5),
('Mathematics', 'Probability and Statistics', 'Probability theory, Bayes Theorem', 5),
('Mathematics', 'Probability and Statistics', 'Averages, Mean, Median, Mode, Variance, SD', 5),
('Mathematics', 'Algebra', 'Quadratic equations, roots & coefficients', 5),
('Mathematics', 'Algebra', 'Indices, logarithms, exponentials', 5),
('Mathematics', 'Algebra', 'Progressions (arithmetic, geometric, harmonic)', 5),
('Mathematics', 'Algebra', 'Matrices & determinants, linear equations', 5),
('Mathematics', 'Algebra', 'Permutations & Combinations, Binomial Theorem', 5),
('Mathematics', 'Coordinate Geometry', 'Cartesian coordinates, lines, intersection', 5),
('Mathematics', 'Coordinate Geometry', 'Circles, parabola, ellipse, hyperbola', 5),
('Mathematics', 'Coordinate Geometry', 'Tangents and normal to circles and conics', 5),
('Mathematics', 'Calculus', 'Limits, continuity, intermediate value theorem', 5),
('Mathematics', 'Calculus', 'Differentiation & applications, maxima/minima', 5),
('Mathematics', 'Calculus', 'Integration (parts, substitution, partial fraction)', 5),
('Mathematics', 'Calculus', 'Definite integrals, area computations', 5),
('Mathematics', 'Trigonometry', 'Trigonometric functions & identities', 5),
('Mathematics', 'Trigonometry', 'Inverse trigonometric functions', 5),
('Mathematics', 'Trigonometry', 'Properties and solution of triangles', 5),
('Mathematics', 'Trigonometry', 'Heights and distances, trigonometric equations', 5),

-- Analytical Ability & Logical Reasoning (24% weight)
('Analytical Ability & Logical Reasoning', 'Reasoning', 'Blood relations, coding-decoding, direction test', 2),
('Analytical Ability & Logical Reasoning', 'Reasoning', 'Seating arrangement, puzzles, input-output', 2),
('Analytical Ability & Logical Reasoning', 'Reasoning', 'Syllogism, alphanumeric series, mirror images', 2),
('Analytical Ability & Logical Reasoning', 'Reasoning', 'Statements and conclusions/arguments', 2),
('Analytical Ability & Logical Reasoning', 'Reasoning', 'Problem solving, Critical thinking', 2),
('Analytical Ability & Logical Reasoning', 'Reasoning', 'Data Interpretation, Data Visualization', 2),
('Analytical Ability & Logical Reasoning', 'Reasoning', 'Numerical Reasoning, Data Sufficiency', 2),

-- Computer Awareness (12% weight)
('Computer Awareness', 'Computer Basics', 'Organization, CPU, I/O devices, memory', 1),
('Computer Awareness', 'Data Representation', 'Characters, binary/hex, binary arithmetic', 1),
('Computer Awareness', 'Data Representation', 'Floating point, Boolean algebra', 1),
('Computer Awareness', 'Computer Hardware', 'Input/Output devices, Storage, RAM/ROM', 1),
('Computer Awareness', 'Computer Software', 'Operating Systems, System/Application Software', 1),
('Computer Awareness', 'Internet and Email', 'Web Browsing, Email, Online Security', 1),

-- General English (4% weight)
('General English', 'English', 'Comprehension of written text', 1),
('General English', 'English', 'Usage of words (vocabulary), meaning of phrases', 1),
('General English', 'English', 'Grasp of Grammatical Patterns', 1),
('General English', 'English', 'Technical writing', 1);
