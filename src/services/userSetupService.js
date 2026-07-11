import { supabase } from "../lib/supabase";

function getUsername(user, fullName) {
  return (
    fullName?.trim() ||
    user?.user_metadata?.username?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    "لاعب ورد كويست"
  );
}

function hasExplicitUsername(user, fullName) {
  return Boolean(fullName?.trim() || user?.user_metadata?.username?.trim() || user?.user_metadata?.full_name?.trim());
}

export async function ensureUserProfile(user, fullName = "") {
  if (!user) {
    return { profile: null, error: null };
  }

  const username = getUsername(user, fullName);

  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id,username")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return { profile: null, error: readError };
  }

  if (existing) {
    if (!hasExplicitUsername(user, fullName) && existing.username) {
      return { profile: existing, error: null };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id)
      .select("id")
      .single();

    return { profile: data || existing, error };
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username,
      total_points: 0,
      total_xp: 0,
      level: 1,
      games_played: 0,
      wins: 0,
      current_streak: 0,
      best_streak: 0,
    })
    .select("id")
    .single();

  return { profile: data, error };
}

export async function ensureUserProgress(user) {
  if (!user) {
    return { progress: null, error: null };
  }

  const { data: existing, error: readError } = await supabase
    .from("user_progress")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    return { progress: null, error: readError };
  }

  if (existing) {
    return { progress: existing, error: null };
  }

  const { data, error } = await supabase
    .from("user_progress")
    .insert({
      user_id: user.id,
      current_stage: 1,
      highest_stage: 1,
      last_completed_stage: 0,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  return { progress: data, error };
}

export async function ensureUserSetup(user, fullName = "") {
  const profileResult = await ensureUserProfile(user, fullName);

  if (profileResult.error) {
    return { error: profileResult.error };
  }

  const progressResult = await ensureUserProgress(user);

  if (progressResult.error) {
    return { error: progressResult.error };
  }

  return { error: null };
}
