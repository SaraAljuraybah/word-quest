import { supabase } from "../lib/supabase";
import { getActiveUser } from "./profileService";

const PROGRESS_COLUMNS = "id,user_id,current_stage,highest_stage,last_completed_stage,updated_at";

export const guestProgress = {
  id: null,
  user_id: null,
  current_stage: 1,
  highest_stage: 1,
  last_completed_stage: 0,
  updated_at: null,
};

function normalizeProgress(progress) {
  return {
    ...guestProgress,
    ...(progress || {}),
    current_stage: progress?.current_stage || 1,
    highest_stage: progress?.highest_stage || 1,
    last_completed_stage: progress?.last_completed_stage || 0,
  };
}

export async function getUserProgress() {
  const { user, error: userError } = await getActiveUser();

  if (userError) {
    return { progress: guestProgress, user: null, error: userError };
  }

  if (!user) {
    return { progress: guestProgress, user: null, error: null };
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select(PROGRESS_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[progressService] Failed to load user_progress", { userId: user.id, error });
    return { progress: guestProgress, user, error };
  }

  if (data) {
    return { progress: normalizeProgress(data), user, error: null };
  }

  const { data: created, error: insertError } = await supabase
    .from("user_progress")
    .insert({
      user_id: user.id,
      current_stage: 1,
      highest_stage: 1,
      last_completed_stage: 0,
      updated_at: new Date().toISOString(),
    })
    .select(PROGRESS_COLUMNS)
    .single();

  if (insertError) {
    console.error("[progressService] Failed to create user_progress; using local stage 1 progress", {
      userId: user.id,
      error: insertError,
    });
  }

  return { progress: normalizeProgress(created), user, error: insertError };
}

export async function completeStageForUser(stageNumber) {
  const { progress, user, error } = await getUserProgress();

  if (error || !user) {
    const nextStage = Math.max(progress.current_stage, stageNumber + 1);
    return {
      progress: {
        ...progress,
        current_stage: nextStage,
        highest_stage: Math.max(progress.highest_stage, nextStage),
        last_completed_stage: Math.max(progress.last_completed_stage, stageNumber),
      },
      error,
    };
  }

  const nextStage = Math.max(progress.current_stage, stageNumber + 1);
  const updates = {
    current_stage: nextStage,
    highest_stage: Math.max(progress.highest_stage, nextStage),
    last_completed_stage: Math.max(progress.last_completed_stage, stageNumber),
    updated_at: new Date().toISOString(),
  };

  const { data, error: updateError } = await supabase
    .from("user_progress")
    .update(updates)
    .eq("user_id", user.id)
    .select(PROGRESS_COLUMNS)
    .single();

  return { progress: normalizeProgress(data), error: updateError };
}
