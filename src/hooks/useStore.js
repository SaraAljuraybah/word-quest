import { useState } from "react";
import { STORE_ITEMS } from "../constants/store";
import { purchaseStoreItem } from "../services/storeService";

export function useStore({ onProfileChange, onInventoryChange } = {}) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeItemKey, setActiveItemKey] = useState(null);
  const [toast, setToast] = useState(null);

  async function buyItem(itemKey) {
    setIsPurchasing(true);
    setActiveItemKey(itemKey);
    setToast(null);

    const result = await purchaseStoreItem(itemKey);

    if (result.success) {
      setToast({ tone: "success", message: "تم شراء العنصر بنجاح" });
      onProfileChange?.(result.profile);
      onInventoryChange?.();
    } else {
      setToast({ tone: "error", message: result.error?.message || "تعذر إتمام عملية الشراء." });
    }

    setIsPurchasing(false);
    setActiveItemKey(null);
    return result;
  }

  return {
    items: STORE_ITEMS,
    buyItem,
    isPurchasing,
    activeItemKey,
    toast,
    setToast,
  };
}
