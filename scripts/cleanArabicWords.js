/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(rootDir, "data", "raw", "arabic-words.txt");
const OUTPUT_DIR = path.join(rootDir, "data", "processed");
const CSV_OUTPUT = path.join(OUTPUT_DIR, "arabic_words_clean.csv");
const REPORT_OUTPUT = path.join(OUTPUT_DIR, "cleaning_report.json");

const CATEGORY = "عام";
const SOURCE = "arabic_words_cleaned";
const ALLOWED_LENGTHS = new Set([3, 4, 5]);
const PREFIXES = ["وال", "فال", "بال", "كال", "ولل", "فلل", "لل", "ال", "و", "ف", "ب", "ك", "ل"];
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;
const PUNCTUATION_NUMBERS = /[0-9٠-٩۰-۹!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~،؛؟«»…“”‘’]/g;
const NON_ARABIC = /[^\u0621-\u064A]/g;
const ARABIC_WORD = /^[\u0621-\u064A]+$/;
const RARE_OR_MALFORMED_PATTERNS = [
  /[ءؤئ]/,
  /[اإأآ]ا/,
  /وو/,
  /يي/,
  /ىى/,
  /ةة/,
  /ههه/,
  /([\u0621-\u064A])\1/,
  /(?:.)\1\1/,
  /[ذزظضغخثص]{2}/,
  /^[اوي]{2}/,
  /[اوي]{3}/,
];

function normalizeArabicWord(value = "") {
  return value
    .trim()
    .replace(/^\uFEFF/, "")
    .split("/")[0]
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(PUNCTUATION_NUMBERS, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(NON_ARABIC, "");
}

function getDifficulty(length) {
  return length === 5 ? "medium" : "easy";
}

function isArabic(value) {
  return ARABIC_WORD.test(value);
}

function isMalformed(word) {
  if (word.length < 3 || word.length > 5) {
    return true;
  }

  if (!isArabic(word)) {
    return true;
  }

  return RARE_OR_MALFORMED_PATTERNS.some((pattern) => pattern.test(word));
}

function stripAttachedPrefix(word, candidateSet) {
  let current = word;
  let changed = true;

  while (changed) {
    changed = false;

    for (const prefix of PREFIXES) {
      if (!current.startsWith(prefix) || current.length <= prefix.length + 2) {
        continue;
      }

      const remainder = current.slice(prefix.length);
      const remainderLength = Array.from(remainder).length;

      if (candidateSet.has(remainder) && ALLOWED_LENGTHS.has(remainderLength) && isArabic(remainder)) {
        current = remainder;
        changed = true;
        break;
      }
    }
  }

  return current;
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function createWordRow(word) {
  const length = Array.from(word).length;

  return {
    word,
    normalized_word: word,
    length,
    difficulty: getDifficulty(length),
    category: CATEGORY,
    source: SOURCE,
    is_active: true,
  };
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Missing source file: ${path.relative(rootDir, INPUT_PATH)}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const rawLines = fs.readFileSync(INPUT_PATH, "utf8").split(/\r?\n/);
  const originalCount = rawLines.filter((line) => line.trim()).length;
  const normalizedCandidates = [];
  const candidateSet = new Set();
  const sampleRejected = [];

  for (const rawLine of rawLines) {
    const normalized = normalizeArabicWord(rawLine);

    if (!normalized) {
      if (sampleRejected.length < 40 && rawLine.trim()) {
        sampleRejected.push({ word: rawLine.trim(), reason: "empty_after_cleaning" });
      }
      continue;
    }

    normalizedCandidates.push({ raw: rawLine.trim(), normalized });
    candidateSet.add(normalized);
  }

  const cleanSet = new Set();
  const rejectionReasons = new Map();

  for (const candidate of normalizedCandidates) {
    const stripped = stripAttachedPrefix(candidate.normalized, candidateSet);
    const length = Array.from(stripped).length;
    let reason = "";

    if (!ALLOWED_LENGTHS.has(length)) {
      reason = "invalid_length";
    } else if (isMalformed(stripped)) {
      reason = "rare_or_malformed";
    }

    if (reason) {
      rejectionReasons.set(reason, (rejectionReasons.get(reason) || 0) + 1);

      if (sampleRejected.length < 40) {
        sampleRejected.push({ word: candidate.raw, normalized: candidate.normalized, candidate: stripped, reason });
      }

      continue;
    }

    cleanSet.add(stripped);
  }

  const rows = [...cleanSet]
    .sort((a, b) => a.length - b.length || a.localeCompare(b, "ar"))
    .map(createWordRow);

  const csvLines = [
    "word,normalized_word,length,difficulty,category,source,is_active",
    ...rows.map((row) =>
      [
        csvCell(row.word),
        csvCell(row.normalized_word),
        row.length,
        csvCell(row.difficulty),
        csvCell(row.category),
        csvCell(row.source),
        row.is_active,
      ].join(",")
    ),
  ];

  fs.writeFileSync(CSV_OUTPUT, `${csvLines.join("\n")}\n`, "utf8");

  const countByLength = rows.reduce((counts, row) => {
    counts[row.length] = (counts[row.length] || 0) + 1;
    return counts;
  }, {});
  const report = {
    original_count: originalCount,
    cleaned_count: rows.length,
    removed_count: Math.max(0, originalCount - rows.length),
    count_by_length: {
      3: countByLength[3] || 0,
      4: countByLength[4] || 0,
      5: countByLength[5] || 0,
    },
    rejection_reasons: Object.fromEntries(rejectionReasons),
    sample_accepted_words: rows.slice(0, 40).map((row) => row.word),
    sample_rejected_words: sampleRejected,
  };

  fs.writeFileSync(REPORT_OUTPUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Original: ${report.original_count}`);
  console.log(`Cleaned: ${report.cleaned_count}`);
  console.log(`Removed: ${report.removed_count}`);
  console.log(`CSV: ${path.relative(rootDir, CSV_OUTPUT)}`);
  console.log(`Report: ${path.relative(rootDir, REPORT_OUTPUT)}`);
}

main();
