# Arabic Word Source

Use `data/manual/approved_arabic_words.csv` as the trusted starter list for the game.

Do not use `data/processed/arabic_words_clean.csv` as a game word source. That file came from an over-broad generated/cleaned dataset and includes invalid letter combinations that are not real Arabic words.

Approved word lists must be curated from real dictionary/source entries or reviewed manually. Do not create words by combining Arabic letters.

Put your open Arabic word list at:

```txt
data/arabic_words.txt
```

Recommended sources include Ayaspell / Hunspell Arabic or another clean open Arabic word list.

Then run:

```bash
npm run words:import
npm run words:apply
npm run stages:generate
```

The importer will not invent categories. Imported words use:

- `category = "عام"`
- `source = "arabic_open_dictionary"`
- `is_active = true`
