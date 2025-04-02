import * as table from '$lib/server/db/schema';
import {
  shoppingCategory,
  type ShoppingCategory,
  type ShoppingItem,
  shoppingItem,
  type StagedShoppingItem,
  type User
} from '$lib/server/db/schema';
import { and, asc, eq, inArray, max, sql } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { error } from '@sveltejs/kit';
// *** Import fast-levenshtein using the default import for CJS compatibility ***
import levenshteinPkg from 'fast-levenshtein';
import { getTx } from '$lib/context';
// The actual function is usually on the '.get' property for this library
const levenshtein = levenshteinPkg.get;

// ------- USER RELATED -------
export const findUser = async (userId: string): Promise<User | undefined> => {
  const db = getTx();

  const result = await db.select().from(table.user).where(eq(table.user.id, userId));

  return result.at(0);
};

export const findAllUsers = async (): Promise<User[]> => {
  const db = getTx();

  return db.select().from(table.user).execute();
};

export const addUser = async (username: string): Promise<void> => {
  const db = getTx();

  await db.insert(table.user).values({ id: generateUUID(), username }).execute();
};

// ------- SHOPPING RELATED -------
export const findShoppingCategory = async (categoryId: string) => {
  const db = getTx();

  return db.query.shoppingCategory.findFirst({
    with: {
      shoppingItems: {
        orderBy: [asc(shoppingItem.priority)]
      }
    },
    where: eq(table.shoppingCategory.id, categoryId)
  }).execute();
};

export const findAllShoppingCategories = async (): Promise<ShoppingCategory[]> => {
  const db = getTx();

  return db.query.shoppingCategory.findMany({
    with: {
      shoppingItems: {
        orderBy: [asc(shoppingItem.priority)]
      }
    },
    orderBy: [asc(shoppingCategory.priority)]
  }).execute();
};

export const updateShoppingCategory = async (categoryId: string, name: string, itemIds: string[]): Promise<void> => {
  const db = getTx();

  await db.update(table.shoppingCategory).set({ name: name }).where(eq(table.shoppingCategory.id, categoryId)).execute();

  if (itemIds.length > 0) {
    await db.delete(table.shoppingItem).where(inArray(table.shoppingItem.id, itemIds));
  }
};

export const addShoppingCategory = async (name: string): Promise<void> => {
  const db = getTx();

  const currentMaxPriority = (
    await db
      .select({ value: max(table.shoppingCategory.priority) })
      .from(table.shoppingCategory)
  ).at(0);
  const nextPriority = typeof currentMaxPriority?.value === 'number' ? currentMaxPriority.value + 1 : 0;

  await db.insert(table.shoppingCategory).values({
    id: generateUUID(),
    name: name,
    priority: nextPriority
  });
};

export const updateOrdering = async (newOrder: string[]): Promise<void> => {
  const db = getTx();

  if (!Array.isArray(newOrder)) {
    throw error(400, 'Invalid input: Expected an array of IDs.');
  }

  if (newOrder.length === 0) {
    throw error(400, 'Invalid input: The array cannot be empty.');
  }

  // Check for duplicate IDs *within the request* (important!)
  const uniqueIds = new Set(newOrder);
  if (uniqueIds.size !== newOrder.length) {
    throw error(400, 'Invalid input: Duplicate IDs are not allowed.');
  }

  await db.transaction(async (tx) => {
    for (const [index, id] of newOrder.entries()) {
      await tx
        .update(table.shoppingCategory)
        .set({ priority: index })
        .where(eq(table.shoppingCategory.id, id));
    }
  });
};

export const findShoppingItem = async (name: string): Promise<ShoppingItem | undefined> => {
  const db = getTx();

  return (await db.select()
      .from(table.shoppingItem)
      .where(sql`lower(
      ${table.shoppingItem.name}
      )
      =
      ${name.toLowerCase()}`)
  ).at(0);
};

/**
 * Finds shopping items with names similar to the input name using Levenshtein distance.
 * Calculates distance in the application code using the 'fast-levenshtein' library.
 *
 * @param name The name to search for similar items.
 * @param maxDistance The maximum Levenshtein distance to consider an item "similar". Defaults to 2.
 */
export const findSimilarShoppingItem = async (
  name: string,
  maxDistance: number = 2
): Promise<ShoppingItem | null> => {
  const db = getTx();

  // Fetch all items from the database.
  // Consider optimizations for very large lists if needed.
  const allItems = await db.select()
    .from(table.shoppingItem)
    .execute();

  const lowerCaseName = name.toLowerCase();

  let closestItem = null;
  let minDistanceFound = Infinity; // Start with a distance larger than any possible outcome

  for (const item of allItems) {
    const itemNameLower = item.name.toLowerCase();

    // Avoid comparing the item with itself (exact match)
    if (itemNameLower === lowerCaseName) {
      continue; // Skip to the next item
    }

    // Calculate Levenshtein distance
    const distance = levenshtein(lowerCaseName, itemNameLower);

    // Check if this item is within the threshold AND closer than the current best match found
    if (distance > 0 && distance <= maxDistance && distance < minDistanceFound) {
      // We found a new closest item
      minDistanceFound = distance;
      closestItem = item;
    }
  }

  // Return the single closest item found (or null if none met the criteria)
  return closestItem;
};

export const reactivateShoppingItem = async (itemId: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.update(table.shoppingItem).set({
    active: true,
    amount: amount
  }).where(eq(table.shoppingItem.id, itemId)).execute();
};

export const addShoppingItem = async (categoryId: string, name: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  // If we have a matching inactive item, we just make it active again.
  const existingItemId = (await db.select({ id: table.shoppingItem.id })
      .from(table.shoppingItem)
      .where(and(
        eq(table.shoppingItem.categoryId, categoryId),
        eq(table.shoppingItem.name, name),
        eq(table.shoppingItem.active, false)
      ))
  ).at(0)?.id;
  if (existingItemId) {
    await db.update(table.shoppingItem).set({
      active: true,
      amount: amount
    }).where(eq(table.shoppingItem.id, existingItemId)).execute();

    return;
  }

  // Otherwise we add a new item at the end of the list.
  const currentMaxPriority = (
    await db
      .select({ value: max(table.shoppingItem.priority) })
      .from(table.shoppingItem)
      .where(eq(table.shoppingItem.categoryId, categoryId))
  ).at(0);
  const nextPriority = typeof currentMaxPriority?.value === 'number' ? currentMaxPriority.value + 1 : 0;

  await db.insert(table.shoppingItem).values({
    id: generateUUID(),
    categoryId: categoryId,
    name: name,
    amount: amount,
    priority: nextPriority,
    active: true
  });
};

export const createPurchase = async (user: User, itemIds: string[]): Promise<void> => {
  const db = getTx();

  // 1. Create a new purchase
  let purchaseId = generateUUID();
  await db.insert(table.shoppingPurchase)
    .values({
      id: purchaseId,
      date: new Date(),
      userId: user.id
    })
    .execute();

  // 2. Create entries in the junction table (shoppingPurchaseItem)
  const purchaseItemInserts = itemIds.map((itemId) => ({
    purchaseId,
    itemId
  }));
  await db.insert(table.shoppingPurchaseItem).values(purchaseItemInserts);

  // 3. Deactivate the shopping items
  await db.update(table.shoppingItem).set({ active: false }).where(inArray(table.shoppingItem.id, itemIds)).execute();
};

export const findStagedShoppingList = async (userId: string) => {
  const db = getTx();

  return db.query.stagedShoppingList.findFirst({
    with: {
      stagedItems: {
        with: {
          suggestedItem: {},
          matchedItem: {}
        }
      }
    },
    where: eq(table.stagedShoppingList.userId, userId)
  }).execute();
};

export const addStagedShoppingList = async (userId: string): Promise<string> => {
  const db = getTx();

  const id = generateUUID();
  await db.insert(table.stagedShoppingList).values({
    id: id,
    userId: userId,
    status: 'validating'
  });

  return id;
};

export const addPerfectStagedItem = async (listId: string, matchedItem: ShoppingItem, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.insert(table.stagedShoppingItem).values({
    id: generateUUID(),
    listId: listId,
    status: 'perfect_match',
    name: matchedItem.name,
    amount: amount ?? '',
    matchedItemId: matchedItem.id
  });
};

export const addCloseStagedItem = async (listId: string, suggestedItem: ShoppingItem, name: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.insert(table.stagedShoppingItem).values({
    id: generateUUID(),
    listId: listId,
    status: 'close_match',
    name: name,
    amount: amount ?? '',
    suggestedItemId: suggestedItem.id
  });
};

export const matchStagedItem = async (item: StagedShoppingItem): Promise<void> => {
  const db = getTx();

  await db.update(table.stagedShoppingItem)
    .set({ matchedItemId: item.suggestedItemId, suggestedItemId: null, status: 'perfect_match' })
    .where(eq(table.stagedShoppingItem.id, item.id));
};

export const unmatchStagedItem = async (item: StagedShoppingItem): Promise<void> => {
  const db = getTx();

  await db.update(table.stagedShoppingItem)
    .set({ suggestedItemId: null, status: 'unmatched' })
    .where(eq(table.stagedShoppingItem.id, item.id));
};

export const addNewStagedItem = async (listId: string, name: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.insert(table.stagedShoppingItem).values({
    id: generateUUID(),
    listId: listId,
    status: 'unmatched',
    name: name,
    amount: amount ?? ''
  });
};

export const commitStagedItems = async (userId: string) => {
  const db = getTx();

  // Get the staged list.
  const list = await db.query.stagedShoppingList.findFirst({
    with: {
      stagedItems: {}
    },
    where: eq(table.stagedShoppingList.userId, userId)
  }).execute();

  if (!list) {
    throw new Error('Trying to commit nonexistent list.');
  }

  // Commit every item.
  for (const item of list.stagedItems) {
    switch (item.status) {
      case 'close_match':
        throw new Error('Trying to commit an unfinished list.');
      case 'perfect_match':
        await reactivateShoppingItem(item.matchedItemId as string, item.amount);
        continue;
      case 'unmatched':
        // todo implement
        throw new Error('not implemented yet');
    }
  }

  // Delete the staged list
  await db.delete(table.stagedShoppingList).where(eq(table.stagedShoppingList.userId, userId)).execute();
};

// ------- GENERIC -------
function generateUUID() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  return encodeBase32LowerCase(bytes);
}
