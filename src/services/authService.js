import { supabase } from "../lib/supabase";

export function loginWithEmail({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function registerWithEmail({ email, password, username, fullName }) {
  return supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        username: (username || fullName || "").trim(),
      },
    },
  });
}

export function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email);
}
