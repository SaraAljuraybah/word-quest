import { supabase } from "../lib/supabase";
import { getStoreItem } from "../constants/store";
import { addInventoryItem } from "./inventoryService";
import { deductProfilePoints, getActiveUser } from "./profileService";

export async function purchaseStoreItem(itemKey) {
  const item = getStoreItem(itemKey);

  if (!item) {
    return { success: false, error: new Error("العنصر غير موجود."), profile: null, inventoryItem: null };
  }

  const { user } = await getActiveUser();

  if (!user) {
    return { success: false, error: new Error("يجب تسجيل الدخول قبل الشراء."), profile: null, inventoryItem: null };
  }

  const pointsResult = await deductProfilePoints(item.cost);

  if (pointsResult.error) {
    return { success: false, error: pointsResult.error, profile: pointsResult.profile, inventoryItem: null };
  }

  const inventoryResult = await addInventoryItem(item.key, 1);

  if (inventoryResult.error) {
    return {
      success: false,
      error: inventoryResult.error,
      profile: pointsResult.profile,
      inventoryItem: null,
    };
  }

  const { error: purchaseError } = await supabase.from("purchases").insert({
    user_id: user.id,
    item_key: item.key,
    cost: item.cost,
    created_at: new Date().toISOString(),
  });

  if (purchaseError) {
    return {
      success: false,
      error: purchaseError,
      profile: pointsResult.profile,
      inventoryItem: inventoryResult.item,
    };
  }

  return {
    success: true,
    error: null,
    profile: pointsResult.profile,
    inventoryItem: inventoryResult.item,
    item,
  };
}
