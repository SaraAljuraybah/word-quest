/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(rootDir, "data", "manual", "approved_arabic_words.csv");
const MAX_STAGES = 1000;
const STAGE_TYPE = "word_guess";
const WORD_SOURCE = "manual_approved";
const REQUIRED_COLUMNS = ["word", "normalized_word", "length", "difficulty", "category", "source", "is_active"];
const STAGE_ID_COLUMNS = "stage_number,word_id";
const WORD_ID_COLUMNS = "id";

const WORLD_PRESETS = {
  1: {
    name: "وادي الحروف",
    description: "كلمات قصيرة وسهلة لبداية الرحلة.",
    theme: "emerald",
  },
  2: {
    name: "سوق الكلمات",
    description: "تحديات أطول بقليل من القائمة المعتمدة.",
    theme: "gold",
  },
  3: {
    name: "قلعة المعاني",
    description: "كلمات من خمس حروف للمرحلة التالية.",
    theme: "violet",
  },
};

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

function getSupabaseClient() {
  const env = { ...readEnv(), ...process.env };
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing VITE_SUPABASE_URL in .env.");
  }

  if (!supabaseKey) {
    throw new Error(
      [
        "Missing SUPABASE_SERVICE_ROLE_KEY in .env.",
        "The approved word importer writes seed data and must use the Supabase service_role key.",
        "Do not use VITE_SUPABASE_ANON_KEY for this script; anon/authenticated keys are blocked by RLS.",
      ].join("\n")
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function readApprovedRows() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Missing approved word file: ${path.relative(rootDir, INPUT_PATH)}`);
  }

  const [headerLine, ...lines] = fs.readFileSync(INPUT_PATH, "utf8").trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));

  if (missingColumns.length) {
    throw new Error(`Approved CSV is missing columns: ${missingColumns.join(", ")}`);
  }

  const seen = new Set();

  return lines
    .filter((line) => line.trim())
    .map((line) => {
      const values = parseCsvLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
      const length = Number(row.length);
      const isActive = row.is_active === "true";

      if (!row.word || !row.normalized_word || ![3, 4, 5].includes(length)) {
        throw new Error(`Invalid approved word row: ${line}`);
      }

      if (row.normalized_word.length !== length) {
        throw new Error(`Length mismatch for approved word: ${row.word}`);
      }

      if (seen.has(row.normalized_word)) {
        throw new Error(`Duplicate approved normalized_word: ${row.normalized_word}`);
      }

      seen.add(row.normalized_word);

      return {
        word: row.word,
        normalized_word: row.normalized_word,
        length,
        difficulty: row.difficulty,
        category: row.category,
        source: row.source || WORD_SOURCE,
        is_active: isActive,
      };
    });
}

function getWorldNumber(stageNumber) {
  return Math.floor((stageNumber - 1) / 100) + 1;
}

function getRequiredLength(stageNumber) {
  if (stageNumber <= 20) {
    return 3;
  }

  if (stageNumber <= 50) {
    return 4;
  }

  return 5;
}

function getDifficulty(length) {
  return length === 5 ? "medium" : "easy";
}

function getRewards(stageNumber) {
  let rewardPoints = stageNumber <= 20 ? 50 : stageNumber <= 50 ? 75 : 100;
  let rewardXp = stageNumber <= 20 ? 25 : stageNumber <= 50 ? 35 : 50;

  if (stageNumber % 100 === 0) {
    rewardPoints += 100;
    rewardXp += 50;
  }

  return { reward_points: rewardPoints, reward_xp: rewardXp };
}

function getWorldPayload(worldNumber) {
  const preset = WORLD_PRESETS[worldNumber] || {
    name: `العالم ${worldNumber}`,
    description: "عالم جديد من كلمات القائمة المعتمدة.",
    theme: "classic",
  };

  return {
    world_number: worldNumber,
    ...preset,
    unlock_stage: (worldNumber - 1) * 100 + 1,
  };
}

async function upsertWords(supabase, rows) {
  const batchSize = 250;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase.from("words").upsert(batch, { onConflict: "normalized_word" });

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    console.log(`Imported words ${Math.min(index + batch.length, rows.length)} / ${rows.length}`);
  }
}

async function getImportedWords(supabase, approvedRows) {
  const approvedWords = new Set(approvedRows.map((row) => row.normalized_word));
  const { data, error } = await supabase
    .from("words")
    .select("id,normalized_word,length")
    .eq("source", WORD_SOURCE)
    .eq("is_active", true)
    .in("length", [3, 4, 5])
    .order("normalized_word", { ascending: true });

  if (error) {
    throw new Error(formatSupabaseError(error));
  }

  const manualWords = (data || []).filter((word) => approvedWords.has(word.normalized_word));

  console.log(`Fetched live manual-approved words from Supabase: ${manualWords.length}`);

  return manualWords.reduce(
    (groups, word) => {
      groups[word.length].push(word);
      return groups;
    },
    { 3: [], 4: [], 5: [] }
  );
}

async function ensureWorlds(supabase, stageCount) {
  const worldCount = getWorldNumber(stageCount);
  const worlds = Array.from({ length: worldCount }, (_, index) => getWorldPayload(index + 1));
  const { error } = await supabase.from("worlds").upsert(worlds, { onConflict: "world_number" });

  if (error) {
    throw new Error(formatSupabaseError(error));
  }

  const { data, error: readError } = await supabase
    .from("worlds")
    .select("id,world_number")
    .in("world_number", worlds.map((world) => world.world_number));

  if (readError) {
    throw new Error(formatSupabaseError(readError));
  }

  return new Map(data.map((world) => [world.world_number, world.id]));
}

function buildStages(wordsByLength, worldIds) {
  const cursors = { 3: 0, 4: 0, 5: 0 };
  const stages = [];

  for (let stageNumber = 1; stageNumber <= MAX_STAGES; stageNumber += 1) {
    const length = getRequiredLength(stageNumber);
    const word = wordsByLength[length][cursors[length]];

    if (!word) {
      break;
    }

    cursors[length] += 1;

    const worldNumber = getWorldNumber(stageNumber);

    stages.push({
      stage_number: stageNumber,
      world_id: worldIds.get(worldNumber),
      word_id: word.id,
      stage_type: STAGE_TYPE,
      difficulty: getDifficulty(length),
      ...getRewards(stageNumber),
    });
  }

  return stages;
}

function countAvailableStages(wordsByLength) {
  const cursors = { 3: 0, 4: 0, 5: 0 };
  let stageCount = 0;

  for (let stageNumber = 1; stageNumber <= MAX_STAGES; stageNumber += 1) {
    const length = getRequiredLength(stageNumber);

    if (!wordsByLength[length][cursors[length]]) {
      break;
    }

    cursors[length] += 1;
    stageCount = stageNumber;
  }

  return stageCount;
}

async function upsertStages(supabase, stages) {
  const batchSize = 250;

  for (let index = 0; index < stages.length; index += batchSize) {
    const batch = stages.slice(index, index + batchSize);
    const { error } = await supabase.from("stages").upsert(batch, { onConflict: "stage_number" });

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    console.log(`Generated stages ${Math.min(index + batch.length, stages.length)} / ${stages.length}`);
  }
}

async function deleteGeneratedStages(supabase) {
  const { error } = await supabase
    .from("stages")
    .delete()
    .gte("stage_number", 1)
    .lte("stage_number", MAX_STAGES);

  if (error) {
    throw new Error(formatSupabaseError(error));
  }

  console.log(`Deleted existing generated stages in range 1-${MAX_STAGES}.`);
}

async function fetchAllRows(supabase, table, columns, queryBuilder) {
  const batchSize = 1000;
  const rows = [];

  for (let from = 0; ; from += batchSize) {
    let query = supabase.from(table).select(columns);

    if (queryBuilder) {
      query = queryBuilder(query);
    }

    const { data, error } = await query.range(from, from + batchSize - 1);

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    rows.push(...(data || []));

    if (!data || data.length < batchSize) {
      break;
    }
  }

  return rows;
}

async function validateStageWordLinks(supabase, stageCount) {
  const stages = await fetchAllRows(supabase, "stages", STAGE_ID_COLUMNS, (query) =>
    query.gte("stage_number", 1).lte("stage_number", stageCount).order("stage_number", { ascending: true })
  );

  const wordIds = [...new Set(stages.map((stage) => stage.word_id).filter(Boolean))];
  const existingWordIds = new Set();
  const batchSize = 500;

  for (let index = 0; index < wordIds.length; index += batchSize) {
    const batch = wordIds.slice(index, index + batchSize);
    const { data, error } = await supabase.from("words").select(WORD_ID_COLUMNS).in("id", batch);

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    for (const word of data || []) {
      existingWordIds.add(word.id);
    }
  }

  const missingWordStages = stages.filter((stage) => !stage.word_id || !existingWordIds.has(stage.word_id));

  console.log(`Stage validation: stages=${stages.length}`);
  console.log(`Stage validation: stages_with_missing_word_id=${missingWordStages.length}`);

  if (missingWordStages.length) {
    console.error("Stage validation failed. Missing word links:", missingWordStages);
    throw new Error(`${missingWordStages.length} generated stages point to missing words.`);
  }
}

function formatSupabaseError(error) {
  const message = error?.message || String(error);

  if (message.includes("schema cache") || message.includes("Could not find")) {
    return [
      message,
      "",
      "Your Supabase schema is missing one or more required columns, or PostgREST has stale schema cache.",
      "Run supabase/setup_approved_words.sql in the Supabase SQL Editor, wait a few seconds, then rerun npm run words:approved.",
    ].join("\n");
  }

  if (message.includes("row-level security")) {
    return [
      message,
      "",
      "This script is running without a valid SUPABASE_SERVICE_ROLE_KEY.",
      "Add SUPABASE_SERVICE_ROLE_KEY to .env using the service_role key from Supabase Project Settings > API, then rerun npm run words:approved.",
    ].join("\n");
  }

  return message;
}

async function main() {
  const approvedRows = readApprovedRows();
  const supabase = getSupabaseClient();

  await upsertWords(supabase, approvedRows);

  const wordsByLength = await getImportedWords(supabase, approvedRows);
  const stageCount = countAvailableStages(wordsByLength);

  if (!stageCount) {
    throw new Error("No stages could be generated from the approved words.");
  }

  const worldIds = await ensureWorlds(supabase, stageCount);
  const stages = buildStages(wordsByLength, worldIds);

  await deleteGeneratedStages(supabase);
  await upsertStages(supabase, stages);
  await validateStageWordLinks(supabase, stages.length);

  console.log(`Approved words imported: ${approvedRows.length}`);
  console.log(`Stages generated: ${stages.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
