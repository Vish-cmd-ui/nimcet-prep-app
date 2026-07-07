-- Add video tracking columns to the topics table
ALTER TABLE topics
ADD COLUMN video_url text,
ADD COLUMN video_channel text;

-- Update topics with YouTube Videos
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=7U0-_3yoU4A', video_channel = 'Neha Agrawal Mathematically Inclined' WHERE subtopic = 'Functions and Relations';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=mv4mVz_ccWk', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Quadratic equations, roots & coefficients';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=t_3TEzEZfo4', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Progressions (arithmetic, geometric, harmonic)';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=orc2FHIKZA8', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Matrices & determinants, linear equations';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=lmk1sJo0728', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Permutations & Combinations, Binomial Theorem';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=eAMCL-mMmcY', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Permutations & Combinations, Binomial Theorem';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=69hDPlQ-sbw', video_channel = 'Neha Agrawal Mathematically Inclined' WHERE subtopic = 'Indices, logarithms, exponentials';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=6VjZMGdWkGw', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Cartesian coordinates, lines, intersection';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=Fj6dvUj13GE', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Limits, continuity, intermediate value theorem';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=UP2pMIl2Azc', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Integration (parts, substitution, partial fraction)';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=9gi4TauReCo', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Definite integrals, area computations';
UPDATE topics SET video_url = 'https://www.youtube.com/watch?v=3jy6N-O0Yoc', video_channel = 'Unacademy Atoms (Nishant Vora)' WHERE subtopic = 'Probability theory, Bayes Theorem';
