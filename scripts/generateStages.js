/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const STAGE_COUNT = 1000;
const STAGE_TYPE = "word_guess";

const WORLD_PRESETS = {
  1: {
    name: "عالم البداية",
    description: "كلمات قصيرة وسهلة لتبدأ رحلتك",
    theme: "emerald",
  },
  2: {
    name: "عالم التحدي",
    description: "كلمات أكثر تنوعًا وصعوبة",
    theme: "gold",
  },
  3: {
    name: "عالم الذكاء",
    description: "اختبر ذاكرتك ومعرفتك بالكلمات",
    theme: "violet",
  },
};

const ARABIC_ORDINALS = {
  4: "الرابع",
  5: "الخامس",
  6: "السادس",
  7: "السابع",
  8: "الثامن",
  9: "التاسع",
  10: "العاشر",
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
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing VITE_SUPABASE_URL and a Supabase key in .env.");
  }

  return createClient(supabaseUrl, supabaseKey);
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

  return { rewardPoints, rewardXp };
}

function getWorldPayload(worldNumber) {
  const preset = WORLD_PRESETS[worldNumber];

  if (preset) {
    return {
      world_number: worldNumber,
      ...preset,
      unlock_stage: (worldNumber - 1) * 100 + 1,
    };
  }

  return {
    world_number: worldNumber,
    name: `العالم ${ARABIC_ORDINALS[worldNumber] || worldNumber}`,
    description: "عالم جديد بتحديات كلمات أكثر تنوعًا",
    theme: "classic",
    unlock_stage: (worldNumber - 1) * 100 + 1,
  };
}

async function ensureWorlds(supabase) {
  const worldCount = getWorldNumber(STAGE_COUNT);
  const worlds = Array.from({ length: worldCount }, (_, index) => getWorldPayload(index + 1));
  const { error } = await supabase.from("worlds").upsert(worlds, { onConflict: "world_number" });

  if (error) {
    throw error;
  }

  const { data, error: readError } = await supabase
    .from("worlds")
    .select("id,world_number")
    .in("world_number", worlds.map((world) => world.world_number));

  if (readError) {
    throw readError;
  }

  return new Map(data.map((world) => [world.world_number, world.id]));
}

async function getWordsByLength(supabase) {
  const { data, error } = await supabase
    .from("words")
    .select("id,normalized_word,length")
    .eq("is_active", true)
    .in("length", [3, 4, 5])
    .order("length", { ascending: true })
    .order("normalized_word", { ascending: true });

  if (error) {
    throw error;
  }

  return data.reduce(
    (groups, word) => {
      groups[word.length].push(word);
      return groups;
    },
    { 3: [], 4: [], 5: [] }
  );
}

function buildStages(wordsByLength, worldIds) {
  const cursors = { 3: 0, 4: 0, 5: 0 };
  const stages = [];

  for (let stageNumber = 1; stageNumber <= STAGE_COUNT; stageNumber += 1) {
    const length = getRequiredLength(stageNumber);
    const word = wordsByLength[length][cursors[length]];

    if (!word) {
      throw new Error(`Not enough active ${length}-letter Arabic words to generate stage ${stageNumber}.`);
    }

    cursors[length] += 1;

    const worldNumber = getWorldNumber(stageNumber);
    const { rewardPoints, rewardXp } = getRewards(stageNumber);

    stages.push({
      stage_number: stageNumber,
      world_id: worldIds.get(worldNumber),
      word_id: word.id,
      stage_type: STAGE_TYPE,
      difficulty: getDifficulty(length),
      reward_points: rewardPoints,
      reward_xp: rewardXp,
    });
  }

  return stages;
}

async function upsertStages(supabase, stages) {
  const batchSize = 250;

  for (let index = 0; index < stages.length; index += batchSize) {
    const batch = stages.slice(index, index + batchSize);
    const { error } = await supabase.from("stages").upsert(batch, { onConflict: "stage_number" });

    if (error) {
      throw error;
    }

    console.log(`Generated ${Math.min(index + batch.length, stages.length)} / ${stages.length} stages`);
  }
}

async function main() {
  const supabase = getSupabaseClient();
  const worldIds = await ensureWorlds(supabase);
  const wordsByLength = await getWordsByLength(supabase);
  const stages = buildStages(wordsByLength, worldIds);

  await upsertStages(supabase, stages);
  console.log("Stage generation complete.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
