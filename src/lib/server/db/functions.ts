import { encodeBase32LowerCase } from '@oslojs/encoding';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { and, asc, count, desc, eq, gt, gte, inArray, lt, max, min, or, SQL, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { lte } from 'drizzle-orm/sql/expressions/conditions';
import { getTx } from '$lib/context';
import * as table from '$lib/server/db/schema';
import {
  type Session,
  shoppingCategory,
  type ShoppingCategory,
  type ShoppingCategoryWithRelation,
  type ShoppingItem,
  shoppingItem,
  stagedShoppingPurchaseItem,
  type User,
  type Weekday,
  type WeeklyTask,
  type WeeklyTaskWithRelation
} from '$lib/server/db/schema';

// ------- USER -------
export const findUser = async (userId: string): Promise<User | undefined> => {
  const db = getTx();

  const result = await db.select().from(table.user).where(eq(table.user.id, userId));

  return result.at(0);
};

export const findAllUsers = async (): Promise<User[]> => {
  const db = getTx();

  return db.select().from(table.user).execute();
};

export const addUser = async (username: string, password: string): Promise<string> => {
  const db = getTx();

  const userId = generateUUID();
  const hashingOptions = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB (passed in kilobytes)
    timeCost: 3,       // Number of iterations
    parallelism: 1    // Number of threads to use
  };

  const hashedPassword = await argon2.hash(password, hashingOptions);

  await db.insert(table.user).values({ id: userId, username, password: hashedPassword }).execute();

  return userId;
};

export const updateUser = async (userId: string, username: string, password: string | undefined): Promise<void> => {
  const db = getTx();

  const hashingOptions = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB (passed in kilobytes)
    timeCost: 3, // Number of iterations
    parallelism: 1 // Number of threads to use
  };

  let update: { username: string, password?: string } = { username };
  if (password) {
    const hashedPassword = await argon2.hash(password, hashingOptions);
    update = { ...update, password: hashedPassword };
  }

  await db.update(table.user).set(update).where(eq(table.user.id, userId)).execute();
};

export const isUsernameTaken = async (username: string) => {
  const db = getTx();

  const user = await db.query.user
    .findFirst({ where: eq(table.user.username, username) })
    .execute();

  return !!user;
};

export const findAndVerifyUser = async (username: string, password: string): Promise<User | undefined> => {
  const db = getTx();

  const user = await db.query.user.findFirst({
    where: eq(table.user.username, username)
  }).execute();
  if (!user) {
    return undefined;
  }

  if (await argon2.verify(user.password, password)) {
    return user;
  }

  return undefined;
};

export const updateDefaultDistribution = async (
  distributions: { userId: string; percent: number }[]
): Promise<void> => {
  const db = getTx();

  for (const distribution of distributions) {
    await db
      .update(table.user)
      .set({ defaultDistribution: distribution.percent })
      .where(eq(table.user.id, distribution.userId))
      .execute();
  }
};

// ------- SESSION -------
export const createSession = async (userId: string) => {
  const db = getTx();

  const sessionToken = randomBytes(32).toString('hex');

  const daysToKeepAlive = 10;
  const secondsToKeepAlive = 60 * 60 * 24 * daysToKeepAlive;
  const expiresAt = new Date(Date.now() + secondsToKeepAlive * 1000);

  const session = {
    id: sessionToken,
    userId,
    expiresAt
  };
  await db.insert(table.session).values(session);

  return session;
};

export const findSession = async (sessionToken: string): Promise<Session | undefined> => {
  const db = getTx();

  const result = await db.select()
    .from(table.session)
    .where(and(
      eq(table.session.id, sessionToken),
      gt(table.session.expiresAt, new Date())
    ));

  return result.at(0);
};

// ------- SHOPPING CATEGORY -------
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

export const findAllShoppingCategories = async (): Promise<ShoppingCategoryWithRelation[]> => {
  const db = getTx();

  return db.query.shoppingCategory.findMany({
    with: {
      shoppingItems: {
        with: {
          stagedPurchase: {}
        },
        orderBy: [asc(shoppingItem.priority)]
      }
    },
    orderBy: [asc(shoppingCategory.priority)]
  }).execute();
};

export const findActiveItemsByCategory = async (): Promise<ShoppingCategoryWithRelation[]> => {
  const db = getTx();

  return db.query.shoppingCategory.findMany({
    // only return categories with at least one active item
    where: (category, { exists }) =>
      exists(
        db.select()
          .from(shoppingItem)
          .where(
            and(
              eq(shoppingItem.categoryId, category.id),
              eq(shoppingItem.active, true)
            )
          )
      ),
    // populate the category with its active items
    with: {
      shoppingItems: {
        with: {
          stagedPurchase: {}
        },
        where: eq(shoppingItem.active, true),
        orderBy: [asc(shoppingItem.priority)]
      }
    },
    orderBy: [asc(shoppingCategory.priority)]
  }).execute();
};

export const updateShoppingCategory = async (categoryId: string, name: string): Promise<void> => {
  const db = getTx();

  await db.update(table.shoppingCategory).set({ name: name }).where(eq(table.shoppingCategory.id, categoryId)).execute();
};

export const addShoppingCategory = async (name: string): Promise<void> => {
  const db = getTx();

  // Look for the current maximum priority. If none exists, we use -1 as the fallback.
  const currentMaxPriority = (
    await db
      .select({ value: max(table.shoppingCategory.priority) })
      .from(table.shoppingCategory)
  ).at(0)?.value ?? -1;
  // Increment the current maximum to use as the next one.
  const nextPriority = currentMaxPriority + 1;

  await db.insert(table.shoppingCategory).values({
    id: generateUUID(),
    name: name,
    priority: nextPriority
  });
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const db = getTx();

  await db.delete(table.shoppingCategory).where(eq(table.shoppingCategory.id, categoryId)).execute();
};

export const moveCategoryOrderUp = async (categoryId: string) => {
  const db = getTx();

  const category = await findShoppingCategory(categoryId);
  if (!category) {
    throw new Error('Trying to move a non-existent category');
  }

  const [categoryAbove] = await db
    .select()
    .from(table.shoppingCategory)
    .where(lt(table.shoppingCategory.priority, category.priority))
    .orderBy(desc(table.shoppingCategory.priority))
    .limit(1);

  await executePrioritySwap(categoryAbove, category);
};

export const moveCategoryOrderDown = async (categoryId: string) => {
  const db = getTx();

  const category = await findShoppingCategory(categoryId);
  if (!category) {
    throw new Error('Trying to move a non-existent category');
  }

  const [categoryBelow] = await db
    .select()
    .from(table.shoppingCategory)
    .where(gt(table.shoppingCategory.priority, category.priority))
    .orderBy(asc(table.shoppingCategory.priority))
    .limit(1);

  await executePrioritySwap(category, categoryBelow);
};

async function executePrioritySwap(
  categoryAbove: ShoppingCategory,
  categoryBelow: ShoppingCategory
) {
  const db = getTx();

  await db.update(table.shoppingCategory)
    .set({ priority: categoryAbove.priority })
    .where(eq(table.shoppingCategory.id, categoryBelow.id));

  await db.update(table.shoppingCategory)
    .set({ priority: categoryBelow.priority })
    .where(eq(table.shoppingCategory.id, categoryAbove.id));
}

// ------- SHOPPING ITEM -------
export const findShoppingItem = async (name: string): Promise<ShoppingItem | undefined> => {
  const db = getTx();

  return (await db.select()
      .from(table.shoppingItem)
      .where(eq(lower(table.shoppingItem.name), name.toLowerCase()))
  ).at(0);
};

export const reactivateShoppingItem = async (itemId: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.update(table.shoppingItem).set({
    active: true,
    amount: amount
  }).where(eq(table.shoppingItem.id, itemId)).execute();
};

export const deleteShoppingItems = async (itemIds: string[]): Promise<void> => {
  const db = getTx();

  if (itemIds.length > 0) {
    await db.delete(table.shoppingPurchaseItem).where(inArray(table.shoppingPurchaseItem.itemId, itemIds));
    await db.delete(table.shoppingItem).where(inArray(table.shoppingItem.id, itemIds));
  }
};

export const deactivateShoppingItems = async (itemIds: string[]): Promise<void> => {
  const db = getTx();

  if (itemIds.length > 0) {
    await db.update(table.shoppingItem)
      .set({ active: false })
      .where(inArray(table.shoppingItem.id, itemIds))
      .execute();
  }
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

export const assignCategoryToShoppingItems = async (itemIds: string[], categoryId: string) => {
  const db = getTx();

  await db.update(table.shoppingItem)
    .set({
      categoryId: categoryId
    })
    .where(inArray(table.shoppingItem.id, itemIds)).execute();
};

export const countActiveShoppingItems = async () => {
  const db = getTx();

  return (await db.select({ count: count(table.shoppingItem.id) })
      .from(table.shoppingItem)
      .where(eq(table.shoppingItem.active, true))
      .execute()
  ).at(0)?.count ?? 0;
};

export const findAllShoppingItems = async () => {
  const db = getTx();

  return db.query.shoppingItem.findMany().execute();
};

export const getItemAddSuggestions = async (frequentlyBoughtThreshold: number = 4) => {
  const db = getTx();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Subquery to exclude recently bought items or currently active items
  const excludedItems = db.$with('recent_purchases').as(
    db.select({
      itemId: table.shoppingPurchaseItem.itemId
    })
      .from(table.shoppingPurchaseItem)
      .innerJoin(table.shoppingItem, eq(table.shoppingPurchaseItem.itemId, table.shoppingItem.id))
      .innerJoin(table.shoppingPurchase, eq(table.shoppingPurchaseItem.purchaseId, table.shoppingPurchase.id))
      .where(
        or(
          gte(table.shoppingPurchase.date, sevenDaysAgo),
          eq(table.shoppingItem.active, true)
        )
      )
  );

  return db.with(excludedItems).select({
    id: shoppingItem.id,
    name: shoppingItem.name,
    purchaseCount: count(table.shoppingPurchaseItem.itemId),
    lastPurchaseDate: max(table.shoppingPurchase.date) as SQL<Date>
  })
    .from(shoppingItem)
    .innerJoin(table.shoppingPurchaseItem, eq(shoppingItem.id, table.shoppingPurchaseItem.itemId))
    .innerJoin(table.shoppingPurchase, eq(table.shoppingPurchaseItem.purchaseId, table.shoppingPurchase.id))
    // Any item that isn't excluded
    .where(sql`NOT EXISTS (SELECT 1 FROM
    ${excludedItems}
    WHERE
    ${excludedItems.itemId}
    =
    ${shoppingItem.id}
    )`)
    .groupBy(shoppingItem.id, shoppingItem.name)
    // That has been bought at least X amount of times
    .having(gte(count(table.shoppingPurchaseItem.itemId), frequentlyBoughtThreshold))
    .orderBy(desc(count(table.shoppingPurchaseItem.itemId)))
    .limit(6);
};

// ------- SHOPPING PURCHASE -------
export const createShoppingPurchase = async (userId: string) => {
  const db = getTx();

  const stagedItems = (await findStagedPurchaseItemsByUser(userId))
    .map(stagedItem => stagedItem.itemId);
  if (stagedItems.length === 0) {
    return;
  }

  // Create a new purchase
  const purchaseId = generateUUID();
  await db.insert(table.shoppingPurchase)
    .values({
      id: purchaseId,
      date: new Date(),
      userId
    })
    .execute();

  // Create entries in the junction table
  const purchaseItemInserts = stagedItems.map((itemId) => ({
    purchaseId,
    itemId
  }));
  await db.insert(table.shoppingPurchaseItem).values(purchaseItemInserts);

  // Remove items from staging and deactivate them
  await db.delete(table.stagedShoppingPurchaseItem).where(inArray(stagedShoppingPurchaseItem.itemId, stagedItems));
  await deactivateShoppingItems(stagedItems);

  return purchaseId;
};

export const fetchLastPurchaseDate = async () => {
  const db = getTx();

  return (await db.select({ date: max(table.shoppingPurchase.date) })
      .from(table.shoppingPurchase)
      .execute()
  ).at(0)?.date ?? null;
};

export const findAllPurchases = async () => {
  const db = getTx();

  return db.query.shoppingPurchase.findMany({
    with: {
      shoppingItems: {},
      user: {},
      balanceEntry: {}
    },
    orderBy: [desc(table.shoppingPurchase.date)]
  }).execute();
};

export const stagePurchaseItem = async (itemId: string, userId: string) => {
  const db = getTx();
  const existingStagedItem = await db.query.stagedShoppingPurchaseItem.findFirst({
    where: eq(table.stagedShoppingPurchaseItem.itemId, itemId)
  }).execute();
  if (existingStagedItem) {
    return;
  }

  await db.insert(table.stagedShoppingPurchaseItem).values({ itemId, userId }).execute();
};

export const unstagePurchaseItem = async (itemId: string, userId: string) => {
  const db = getTx();
  await db.delete(table.stagedShoppingPurchaseItem).where(
    and(
      eq(table.stagedShoppingPurchaseItem.itemId, itemId),
      eq(table.stagedShoppingPurchaseItem.userId, userId)
    )
  ).execute();
};

export const findStagedPurchaseItemsByUser = async (userId: string) => {
  const db = getTx();

  return db.query.stagedShoppingPurchaseItem.findMany({
    where: eq(table.stagedShoppingPurchaseItem.userId, userId)
  }).execute();
};

// ------- BALANCE --------
export const addBalanceEntry = async (
  userId: string,
  name: string,
  price: number,
  distributions: { userId: string, percent: number }[],
  purchaseId: string | null
): Promise<void> => {
  const db = getTx();

  const entryId = generateUUID();
  await db.insert(table.balanceEntry).values({
    id: entryId,
    userId,
    date: new Date(),
    name,
    price
  });

  if (purchaseId) {
    await db
      .update(table.shoppingPurchase)
      .set({ balanceEntryId: entryId })
      .where(eq(table.shoppingPurchase.id, purchaseId))
      .execute();
  }

  for (const distribution of distributions) {
    if (distribution.percent > 0) {
      await db.insert(table.balanceEntryDistribution).values({
        entryId,
        userId: distribution.userId,
        percent: distribution.percent
      });
    }
  }
};

export const updateBalanceEntry = async (
  entryId: string,
  userId: string,
  name: string,
  price: number,
  distributions: { userId: string; percent: number }[]
): Promise<void> => {
  const db = getTx();

  await db
    .update(table.balanceEntry)
    .set({ name, userId, price })
    .where(eq(table.balanceEntry.id, entryId))
    .execute();

  await db
    .delete(table.balanceEntryDistribution)
    .where(eq(table.balanceEntryDistribution.entryId, entryId))
    .execute();
  for (const distribution of distributions) {
    if (distribution.percent > 0) {
      await db.insert(table.balanceEntryDistribution).values({
        entryId,
        userId: distribution.userId,
        percent: distribution.percent
      });
    }
  }
};

export const findBalanceEntry = async (entryId: string) => {
  const db = getTx();

  return db.query.balanceEntry
    .findFirst({
      with: {
        distributions: {}
      },
      where: eq(table.balanceEntry.id, entryId)
    })
    .execute();
};

export const findAllBalanceEntries = async () => {
  const db = getTx();

  return db.query.balanceEntry
    .findMany({
      with: {
        user: {}
      },
      orderBy: [desc(table.balanceEntry.date)]
    })
    .execute();
};

export type DebtResult = {
  creditor: User;
  debtorData: {
    debtor: User;
    amount: number;
  }[];
};

export async function calculateUserDebts(): Promise<DebtResult[]> {
  const db = getTx();

  const entries = await db.query.balanceEntry.findMany({
    with: {
      user: true,
      distributions: { with: { user: true } }
    }
  });

  const userRegistry = new Map<string, User>();
  const grossDebtMap: Record<string, Record<string, number>> = {};

  // Accumulate Gross Debts
  for (const entry of entries) {
    const creditorId = entry.userId;
    userRegistry.set(creditorId, entry.user);

    for (const distribution of entry.distributions) {
      if (creditorId === distribution.userId) continue;

      userRegistry.set(distribution.userId, distribution.user);

      const debtorId = distribution.userId;
      const share = Math.round(entry.price * (distribution.percent / 100));

      grossDebtMap[debtorId] ??= {};
      grossDebtMap[debtorId][creditorId] = (grossDebtMap[debtorId][creditorId] || 0) + share;
    }
  }

  // Calculate Net Debts & Group by Creditor
  const resultsByCreditor = new Map<string, DebtResult>();

  for (const debtorId of Object.keys(grossDebtMap)) {
    for (const creditorId of Object.keys(grossDebtMap[debtorId])) {

      const amountAtoB = grossDebtMap[debtorId]?.[creditorId] || 0;
      const amountBtoA = grossDebtMap[creditorId]?.[debtorId] || 0;
      const netAmount = amountAtoB - amountBtoA;

      // Only process positive net flow.
      // The reverse case (B owes A) is handled when the loop encounters that key pair.
      if (netAmount <= 0) continue;

      if (!resultsByCreditor.has(creditorId)) {
        resultsByCreditor.set(creditorId, {
          creditor: userRegistry.get(creditorId) as User,
          debtorData: []
        });
      }

      resultsByCreditor.get(creditorId)!.debtorData.push({
        debtor: userRegistry.get(debtorId) as User,
        amount: netAmount
      });
    }
  }

  return Array.from(resultsByCreditor.values());
}

// ------- STAGED SHOPPING LIST -------
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

export const assignCategoryToStagedItems = async (itemIds: string[], categoryId: string) => {
  const db = getTx();

  await db.update(table.stagedShoppingItem)
    .set({
      selectedCategoryId: categoryId
    })
    .where(inArray(table.stagedShoppingItem.id, itemIds)).execute();
};

export const commitStagedItems = async (userId: string) => {
  const db = getTx();

  const list = await db.query.stagedShoppingList.findFirst({
    with: {
      stagedItems: {}
    },
    where: eq(table.stagedShoppingList.userId, userId)
  }).execute();

  if (!list) {
    throw new Error('Trying to commit nonexistent list.');
  }

  for (const item of list.stagedItems) {
    switch (item.status) {
      case 'perfect_match':
        await reactivateShoppingItem(item.matchedItemId as string, item.amount);
        continue;
      case 'unmatched':
        await addShoppingItem(item.selectedCategoryId as string, item.name, item.amount);
    }
  }

  await deleteStagedList(userId);
};

export const deleteStagedList = async (userId: string) => {
  const db = getTx();

  await db.delete(table.stagedShoppingList).where(eq(table.stagedShoppingList.userId, userId)).execute();
};

// ------- TASKS -------
export const findAllWeeklyTasks = async (): Promise<WeeklyTaskWithRelation[]> => {
  const db = getTx();

  return db.query.weeklyTask.findMany({
    with: {
      dueUser: {},
      completions: {}
    }
  });
};

export const findWeeklyTask = async (taskId: string) => {
  const db = getTx();

  return db.query.weeklyTask.findFirst({
    where: eq(table.weeklyTask.id, taskId),
    with: {
      completions: {}
    }
  }).execute();
};

export const addWeeklyTask = async (name: string, weekday: string, interval: number, userId: string, dueDate: string | null) => {
  const db = getTx();

  const nextDueDate = dueDate ?? formatDateToYYYYMMDD(getNextDueDate(weekday, interval));

  await db.insert(table.weeklyTask).values({
    id: generateUUID(),
    name: name,
    dueWeekday: weekday as Weekday,
    interval,
    dueUserId: userId,
    dueDate: nextDueDate
  });
};

export const updateWeeklyTask = async (taskId: string, name: string, weekday: string, interval: number, userId: string, dueDate: string | null) => {
  const db = getTx();

  const nextDueDate = dueDate ?? formatDateToYYYYMMDD(getNextDueDate(weekday, interval));

  await db.update(table.weeklyTask)
    .set({
      name: name,
      dueWeekday: weekday as Weekday,
      interval,
      dueUserId: userId,
      dueDate: nextDueDate
    })
    .where(eq(table.weeklyTask.id, taskId));
};

export const findAllSingleTasks = async () => {
  const db = getTx();

  return db.query.singleTask.findMany({
    with: {
      dueUser: {}
    }
  });
};

export const findSingleTask = async (taskId: string) => {
  const db = getTx();

  return db.query.singleTask.findFirst({
    where: eq(table.singleTask.id, taskId)
  }).execute();
};

export const addSingleTask = async (name: string, userId: string | null, dueDate: string | null) => {
  const db = getTx();

  await db.insert(table.singleTask).values({
    id: generateUUID(),
    name: name,
    dueUserId: userId,
    dueDate
  });
};

export const updateSingleTask = async (taskId: string, name: string, userId: string | null, dueDate: string | null) => {
  const db = getTx();

  await db.update(table.singleTask)
    .set({
      name: name,
      dueUserId: userId,
      dueDate
    })
    .where(eq(table.singleTask.id, taskId));
};


/**
 * Calculates the date of the next occurrence of a specific weekday based on the current time.
 */
function getNextDueDate(weekdayName: string, interval: number): Date {
  const weekdayMap: { [key: string]: number } = {
    'sun': 0,
    'mon': 1,
    'tue': 2,
    'wed': 3,
    'thu': 4,
    'fri': 5,
    'sat': 6
  };

  const targetDayOfWeek = weekdayMap[weekdayName];

  const now = new Date();
  const currentDayOfWeek = now.getDay();

  // Figure out the distance between target and current weekday.
  let diff = targetDayOfWeek - currentDayOfWeek;
  // If the distance is positive, it means the closest target weekday is in the future. To make the following
  // calculation a bit simpler, we take away 7 days so that `diff` at this point will always point to the most recent
  // matching weekday.
  if (diff > 0) {
    diff -= 7;
  }

  // Now we can simply add 7 days per desired interval to know how many days it takes to get to the next target weekday.
  diff = diff + (7 * interval);

  // Create a new `Date` object starting from `now` and add the calculated difference in days.
  // This preserves the time of day from the `now` object.
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + diff);

  return nextDate;
}

export const markTaskAsDone = async (taskId: string, doneByUserId: string | null = null): Promise<void> => {
  const db = getTx();

  const singleTask = await db.query.singleTask.findFirst({ where: eq(table.singleTask.id, taskId) });
  if (singleTask) {
    await db.update(table.singleTask).set({
      done: true,
      dueUserId: doneByUserId
    }).where(eq(table.singleTask.id, taskId)).execute();

    return;
  }

  const task = await db.query.weeklyTask.findFirst({ where: eq(table.weeklyTask.id, taskId) }) as WeeklyTask;
  const completionUserId = doneByUserId ?? task.dueUserId as string;

  await db.insert(table.weeklyTaskCompletion).values({
    id: generateUUID(),
    taskId,
    userId: completionUserId,
    date: formatDateToYYYYMMDD(new Date())
  });

  const dueDate = formatDateToYYYYMMDD(getNextDueDate(task.dueWeekday, task.interval));
  const dueUserId = await findNextDueUserId(taskId);

  await db.update(table.weeklyTask)
    .set({ dueDate, dueUserId })
    .where(eq(table.weeklyTask.id, taskId))
    .execute();
};

/**
 * Finds which user is supposed to do the task next. This is determined by the following ordering:
 * 1. How often has the task been done already?
 *   => The user with the fewest completions is picked first.
 * 2. When was the first completion?
 *   => When multiple people has the same completion count, the one with the oldest completion is picked first.
 */
async function findNextDueUserId(taskId: string): Promise<string> {
  const db = getTx();

  const completionsPerUser = await db
    .select({
      id: table.user.id,
      completionCount: count(table.weeklyTaskCompletion.id)
        .mapWith(Number)
        .as('completionCount'),
      earliestCompletionDate: min(table.weeklyTaskCompletion.date).as('earliestCompletionDate')
    })
    .from(table.user)
    .leftJoin(
      table.weeklyTaskCompletion,
      and(
        eq(table.user.id, table.weeklyTaskCompletion.userId),
        eq(table.weeklyTaskCompletion.taskId, taskId)
      )
    )
    .groupBy(table.user.id)
    .orderBy(asc(count(table.weeklyTaskCompletion.id)), asc(min(table.weeklyTaskCompletion.date)));

  return completionsPerUser[0].id;
}

export const countDueTasks = async () => {
  const db = getTx();

  return (await db.select({ count: count(table.weeklyTask.id) })
      .from(table.weeklyTask)
      .where(lte(table.weeklyTask.dueDate, formatDateToYYYYMMDD(new Date())))
      .execute()
  ).at(0)?.count ?? 0;
};

// ------- GENERIC -------

/**
 * Formats a Date object into a 'YYYY-MM-DD' string suitable for SQL DATE type.
 * @param date The Date object to format.
 * @returns The date formatted as 'YYYY-MM-DD'.
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  // getMonth() is 0-indexed, so add 1. padStart ensures two digits (e.g., '01' instead of '1').
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  // getDate() gets the day of the month. padStart ensures two digits.
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function generateUUID() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  return encodeBase32LowerCase(bytes);
}

export function lower(value: AnyPgColumn): SQL {
  // Formatting would be a bit ugly, if this call was inlined rather than being in this helper function.
  return sql`lower
      (${value})`;
}