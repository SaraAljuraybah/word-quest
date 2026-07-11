-- Generated Arabic words seed for Word Quest.
-- Regenerate with: npm run words:import -- --input data/wordlists/arabic_words.txt
insert into public.words (word, normalized_word, length, difficulty, category, is_active)
values
('بيت', 'بيت', 3, 'easy', 'general', true),
('قمر', 'قمر', 3, 'easy', 'general', true),
('نور', 'نور', 3, 'easy', 'general', true),
('كتاب', 'كتاب', 4, 'easy', 'general', true),
('لاعب', 'لاعب', 4, 'easy', 'general', true),
('تجربة', 'تجربة', 5, 'medium', 'general', true),
('حديقة', 'حديقة', 5, 'medium', 'general', true),
('كلمات', 'كلمات', 5, 'medium', 'general', true),
('مدرسة', 'مدرسة', 5, 'medium', 'general', true),
('مرحلة', 'مرحلة', 5, 'medium', 'general', true)
on conflict (normalized_word) do update set
  word = excluded.word,
  length = excluded.length,
  difficulty = excluded.difficulty,
  category = excluded.category,
  is_active = excluded.is_active;
