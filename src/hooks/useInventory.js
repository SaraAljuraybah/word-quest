import { useCallback, useEffect, useMemo, useState } from "react";
import { STORE_ITEMS } from "../constants/store";
import { getInventory } from "../services/inventoryService";

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshInventory = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const result = await getInventory();

    setInventory(result.inventory);
    setError(result.error?.message || "");
    setIsLoading(false);

    return result.inventory;
  }, []);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  const inventoryByKey = useMemo(
    () =>
      inventory.reduce((items, item) => {
        items[item.item_key] = item.quantity || 0;
        return items;
      }, {}),
    [inventory]
  );

  const inventorySummary = useMemo(
    () =>
      STORE_ITEMS.map((storeItem) => ({
        ...storeItem,
        quantity: inventoryByKey[storeItem.key] || 0,
      })),
    [inventoryByKey]
  );

  return {
    inventory,
    inventoryByKey,
    inventorySummary,
    isLoading,
    error,
    refreshInventory,
  };
}
