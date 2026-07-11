# Arabic Word Lists

Place a local Arabic word source here before importing.

Recommended open sources:

- Ayaspell / Arabic Hunspell dictionaries.
- LibreOffice Arabic Hunspell dictionaries.
- Any clean Arabic wordlist with a license compatible with the project.

Supported formats:

- `.txt`: one word per line, Hunspell `.dic` entries are accepted.
- `.csv`: words separated by commas, tabs, semicolons, Arabic commas, or whitespace.

Importer behavior:

- Removes Arabic diacritics.
- Removes tatweel.
- Normalizes common Arabic letter variants.
- Removes duplicates.
- Removes entries with non-Arabic characters.
- Keeps only 3, 4, 5, 6, and 7 letter words.
- Calculates `length`, `difficulty`, `category`, and `is_active`.

Example:

```bash
npm run words:import -- --input data/wordlists/arabic_words.txt
npm run words:import -- --input data/wordlists/arabic_words.txt --apply
```

For `--apply`, use a local-only `SUPABASE_SERVICE_ROLE_KEY` if your `words` table blocks anon inserts with RLS. Never expose that key in frontend code.
