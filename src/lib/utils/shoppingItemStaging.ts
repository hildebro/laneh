// Items that couldn't be added yet, because some of them need a category first. They stay on the device until the
// categorization is finished or cancelled. localStorage works the same in the browser and the Capacitor WebView.

export type StagedShoppingItem = {
  name: string,
  amount: string,
  categoryId: string | null,
  needsCategory: boolean
};

// Scoped per user, since several accounts can share one browser.
const storageKey = (userId: string) => `staged_shopping_items_${userId}`;

export function getStagedShoppingItems(userId: string): StagedShoppingItem[] | null {
  try {
    const items = JSON.parse(localStorage.getItem(storageKey(userId)) ?? 'null');

    return Array.isArray(items) && items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export function setStagedShoppingItems(userId: string, items: StagedShoppingItem[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(items));
}

export function clearStagedShoppingItems(userId: string) {
  localStorage.removeItem(storageKey(userId));
}
