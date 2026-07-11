import { supabase } from "../lib/supabase";
import { applyGameResultStats, getProfile } from "./profileService";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, error };
}

export async function createGameSession({ wordId, stageId = null }) {
  const { user, error: userError } = await getCurrentUser();

  if (userError || !user?.id) {
    const error = userError || new Error("Cannot create a game session without an authenticated user.");
    console.error("Failed to create game session", error);
    return { session: null, error, user: null };
  }

  if (!wordId) {
    const error = new Error("Cannot create a game session without word_id.");
    console.error("Failed to create game session", error);
    return { session: null, error, user };
  }

  const payload = {
    user_id: user.id,
    word_id: wordId,
    attempts_used: 0,
    status: "playing",
    points_earned: 0,
    xp_earned: 0,
  };

  if (stageId) {
    payload.stage_id = stageId;
  }

  const { data, error } = await supabase.from("game_sessions").insert(payload).select("id").single();

  if (error) {
    console.error("Failed to create game session", error);
  }

  return { session: data, error, user };
}

export async function finishGameSession({ sessionId, attemptsUsed, status, pointsEarned, xpEarned = 0 }) {
  if (!sessionId) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("game_sessions")
    .update({
      attempts_used: attemptsUsed,
      status,
      points_earned: pointsEarned,
      xp_earned: xpEarned,
      finished_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select("id")
    .single();

  return { data, error };
}

export async function updatePlayerStats({ pointsEarned, hasWon, xpEarned }) {
  return applyGameResultStats({ pointsEarned, hasWon, xpEarned });
}

export async function getPlayerProfile() {
  return getProfile();
}
