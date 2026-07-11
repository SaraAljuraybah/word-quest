import { supabase } from "../lib/supabase";
import { getActiveUser } from "./profileService";

export async function getInventory() {
  const { user, error: userError } = await getActiveUser();

  if (userError) {
    return { inventory: [], error: userError };
  }

  if (!user) {
    return { inventory: [], error: null };
  }

  const { data, error } = await supabase
    .from("user_inventory")
    .select("id,user_id,item_key,quantity,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return { inventory: data || [], error };
}

export async function addInventoryItem(itemKey, quantity = 1) {
  const { user } = await getActiveUser();

  if (!user) {
    return { item: null, error: new Error("يجب تسجيل الدخول أولا.") };
  }

  const { data: existing, error: readError } = await supabase
    .from("user_inventory")
    .select("id,quantity")
    .eq("user_id", user.id)
    .eq("item_key", itemKey)
    .maybeSingle();

  if (readError) {
    return { item: null, error: readError };
  }

  if (existing) {
    const { data, error } = await supabase
      .from("user_inventory")
      .update({
        quantity: (existing.quantity || 0) + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id,user_id,item_key,quantity,created_at,updated_at")
      .single();

    return { item: data, error };
  }

  const { data, error } = await supabase
    .from("user_inventory")
    .insert({
      user_id: user.id,
      item_key: itemKey,
      quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id,user_id,item_key,quantity,created_at,updated_at")
    .single();

  return { item: data, error };
}
