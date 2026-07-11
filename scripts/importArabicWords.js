/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(rootDir, "data", "arabic_words.txt");
const DEFAULT_SQL_OUTPUT = path.join(rootDir, "supabase", "seed", "arabic_words.sql");
const ALLOWED_LENGTHS = new Set([3, 4, 5]);
const SOURCE = "arabic_open_dictionary";
const CATEGORY = "عام";
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;
const PUNCTUATION_AND_NUMBERS = /[0-9٠-٩۰-۹!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~،؛؟«»…“”‘’ـ]/g;

function readEnv() {
  const envPath = path.join(rootDir, ".env");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  return fs.readFileSync(envPath, "utf8").split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      return env;
    }

    const [key, ...valueParts] = trimmed.split("=");
    env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    return env;
  }, {});
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_SQL_OUTPUT,
    apply: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--apply") {
      options.apply = true;
      continue;
    }

    if (arg === "--input") {
      options.input = path.resolve(rootDir, args[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--output") {
      options.output = path.resolve(rootDir, args[index + 1]);
      index += 1;
    }
  }

  return options;
}

export function normalizeArabicWord(value = "") {
  return value
    .trim()
    .replace(/^\uFEFF/, "")
    .split("/")[0]
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(PUNCTUATION_AND_NUMBERS, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, "");
}

function isArabicWord(word) {
  return /^[\u0621-\u064A]+$/.test(word);
}

function getDifficulty(length) {
  return length === 5 ? "medium" : "easy";
}

function extractCandidateWords(content) {
  return content
    .split(/\r?\n/)
    .flatMap((line, index) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return [];
      }

      if (index === 0 && /^\d+$/.test(trimmed)) {
        return [];
      }

      return trimmed.split(/[,\t;،\s]+/);
    });
}

function buildWords(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input wordlist was not found: ${inputPath}`);
  }

  const content = fs.readFileSync(inputPath, "utf8");
  const seen = new Set();
  const rows = [];

  extractCandidateWords(content).forEach((candidate) => {
    const normalized = normalizeArabicWord(candidate);
    const length = Array.from(normalized).length;

    if (!normalized || seen.has(normalized) || !isArabicWord(normalized) || !ALLOWED_LENGTHS.has(length)) {
      return;
    }

    seen.add(normalized);
    rows.push({
      word: normalized,
      normalized_word: normalized,
      length,
      difficulty: getDifficulty(length),
      category: CATEGORY,
      source: SOURCE,
      is_active: true,
    });
  });

  return rows.sort((a, b) => a.length - b.length || a.normalized_word.localeCompare(b.normalized_word, "ar"));
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function writeSql(rows, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const chunks = rows.map(
    (row) =>
      `(${sqlString(row.word)}, ${sqlString(row.normalized_word)}, ${row.length}, ${sqlString(row.difficulty)}, ${sqlString(row.category)}, ${sqlString(row.source)}, ${row.is_active})`
  );
  const sql = [
    "-- Generated Arabic words seed for Word Quest.",
    "-- Regenerate with: npm run words:import",
    "insert into public.words (word, normalized_word, length, difficulty, category, source, is_active)",
    `values\n${chunks.join(",\n")}`,
    "on conflict (normalized_word) do update set",
    "  word = excluded.word,",
    "  length = excluded.length,",
    "  difficulty = excluded.difficulty,",
    "  category = excluded.category,",
    "  source = excluded.source,",
    "  is_active = excluded.is_active;",
    "",
  ].join("\n");

  fs.writeFileSync(outputPath, sql, "utf8");
}

function getSupabaseClient() {
  const env = { ...readEnv(), ...process.env };
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing VITE_SUPABASE_URL and a Supabase key in .env.");
  }

  return createClient(supabaseUrl, supabaseKey);
}

async function upsertRows(rows) {
  const supabase = getSupabaseClient();
  const batchSize = 500;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase.from("words").upsert(batch, { onConflict: "normalized_word" });

    if (error) {
      throw error;
    }

    console.log(`Imported ${Math.min(index + batch.length, rows.length)} / ${rows.length}`);
  }
}

async function main() {
  const options = parseArgs();
  const rows = buildWords(options.input);

  if (!rows.length) {
    throw new Error("No valid Arabic words were found after filtering.");
  }

  writeSql(rows, options.output);
  console.log(`Prepared ${rows.length} Arabic words.`);
  console.log(`Seed SQL written to ${path.relative(rootDir, options.output)}`);

  if (options.apply) {
    await upsertRows(rows);
    console.log("Supabase words table updated.");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
