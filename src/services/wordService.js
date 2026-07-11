import { GAME_CONFIG } from "../constants/game";
import { supabase } from "../lib/supabase";
import { normalizeWord } from "../utils/gameLogic";

const WORD_COLUMNS = "id,word,normalized_word,length,difficulty,category,is_active";

export async function getRandomActiveWord(wordLength = GAME_CONFIG.wordLength) {
  const countResult = await supabase
    .from("words")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("length", wordLength);

  if (countResult.error) {
    return { word: null, error: countResult.error };
  }

  if (!countResult.count) {
    return { word: null, error: new Error("لا توجد كلمات عربية متاحة حاليا.") };
  }

  const offset = Math.floor(Math.random() * countResult.count);
  const { data, error } = await supabase
    .from("words")
    .select(WORD_COLUMNS)
    .eq("is_active", true)
    .eq("length", wordLength)
    .range(offset, offset)
    .single();

  return { word: data, error };
}

export async function validateGuessWord(guess, wordLength = GAME_CONFIG.wordLength) {
  const normalizedGuess = normalizeWord(guess);
  const { data, error } = await supabase
    .from("words")
    .select("id")
    .eq("is_active", true)
    .eq("length", wordLength)
    .eq("normalized_word", normalizedGuess)
    .maybeSingle();

  if (error) {
    return { isValid: false, error };
  }

  return { isValid: Boolean(data), error: null };
}
