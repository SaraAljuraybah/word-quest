import { supabase } from "../lib/supabase";
import { normalizeWord } from "../utils/gameLogic";

const STAGE_COLUMNS =
  "id,stage_number,world_id,word_id,stage_type,difficulty,reward_points,reward_xp,created_at,world:world_id(id,world_number,name,description,theme,unlock_stage),word:word_id(id,word,normalized_word,length,difficulty,category,source,is_active)";
const STAGE_BASE_COLUMNS =
  "id,stage_number,world_id,word_id,stage_type,difficulty,reward_points,reward_xp,created_at,world:world_id(id,world_number,name,description,theme,unlock_stage)";
const WORD_COLUMNS = "id,word,normalized_word,length,difficulty,category,source,is_active";

function normalizeStage(stage) {
  if (!stage) {
    return null;
  }

  const normalizedWord = stage.word
    ? {
        ...stage.word,
        word: normalizeWord(stage.word.normalized_word || stage.word.word),
        normalized_word: normalizeWord(stage.word.normalized_word || stage.word.word),
      }
    : null;

  return {
    ...stage,
    reward_points: stage.reward_points || 0,
    reward_xp: stage.reward_xp || 0,
    difficulty: stage.difficulty || "easy",
    word: normalizedWord,
  };
}

export async function getStageByNumber(stageNumber) {
  const normalizedStageNumber = Number(stageNumber) || 1;
  const joinedResponse = await supabase
    .from("stages")
    .select(STAGE_COLUMNS)
    .eq("stage_number", normalizedStageNumber)
    .maybeSingle();

  if (joinedResponse.error) {
    console.error("[stageService] Stage join query failed", {
      stageNumber: normalizedStageNumber,
      response: joinedResponse,
    });
    return { stage: null, error: joinedResponse.error, response: joinedResponse };
  }

  if (joinedResponse.data?.word) {
    return { stage: normalizeStage(joinedResponse.data), error: null, response: joinedResponse };
  }

  console.warn("[stageService] Stage join returned no word; checking base stage and word separately", {
    stageNumber: normalizedStageNumber,
    response: joinedResponse,
  });

  const baseStageResponse = await supabase
    .from("stages")
    .select(STAGE_BASE_COLUMNS)
    .eq("stage_number", normalizedStageNumber)
    .maybeSingle();

  if (baseStageResponse.error || !baseStageResponse.data) {
    console.error("[stageService] Stage not found by stage_number", {
      stageNumber: normalizedStageNumber,
      response: baseStageResponse,
    });
    return {
      stage: null,
      error: baseStageResponse.error || new Error(`Stage ${normalizedStageNumber} was not found.`),
      response: baseStageResponse,
    };
  }

  const wordResponse = await supabase
    .from("words")
    .select(WORD_COLUMNS)
    .eq("id", baseStageResponse.data.word_id)
    .maybeSingle();

  if (wordResponse.error || !wordResponse.data) {
    console.error("[stageService] Stage exists but associated word was not loaded", {
      stageNumber: normalizedStageNumber,
      stageResponse: baseStageResponse,
      wordResponse,
    });

    return {
      stage: null,
      error: wordResponse.error || new Error(`Word ${baseStageResponse.data.word_id} was not found for stage ${normalizedStageNumber}.`),
      response: { stage: baseStageResponse, word: wordResponse },
    };
  }

  return {
    stage: normalizeStage({ ...baseStageResponse.data, word: wordResponse.data }),
    error: null,
    response: { stage: baseStageResponse, word: wordResponse },
  };
}

export async function getStages() {
  const { data, error } = await supabase
    .from("stages")
    .select(STAGE_COLUMNS)
    .order("stage_number", { ascending: true });

  return { stages: (data || []).map(normalizeStage), error };
}
