import * as table from '$lib/server/db/schema';
import { shoppingCategory, type ShoppingCategory, shoppingItem, type User } from '$lib/server/db/schema';
import { db } from '$lib/server/db/index';
import { and, asc, eq, inArray, max } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// ------- USER RELATED -------
export const findUser = async (userId: string): Promise<User | undefined> => {
  const result = await db.select().from(table.user).where(eq(table.user.id, userId));

  return result.at(0);
};

export const findAllUsers = async (): Promise<User[]> => {
  return db.select().from(table.user).execute();
};

export const addUser = async (username: string): Promise<void> => {
  await db.insert(table.user).values({ id: generateUUID(), username }).execute();
};

// ------- SHOPPING RELATED -------
export const findShoppingCategory = async (categoryId: string) => {
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
  await db.update(table.shoppingCategory).set({ name: name }).where(eq(table.shoppingCategory.id, categoryId)).execute();

  if (itemIds.length > 0) {
    await db.delete(table.shoppingItem).where(inArray(table.shoppingItem.id, itemIds))
  }
};

export const addShoppingCategory = async (name: string): Promise<void> => {
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

export const addShoppingItem = async (categoryId: string, name: string): Promise<void> => {
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
    await db.update(table.shoppingItem).set({ active: true }).where(eq(table.shoppingItem.id, existingItemId)).execute();

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
    priority: nextPriority,
    active: true
  });
};

export const createPurchase = async (user: User, itemIds: string[]): Promise<void> => {
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

// ------- GENERIC -------
function generateUUID() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  return encodeBase32LowerCase(bytes);
}
