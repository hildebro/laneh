// noinspection JSUnusedGlobalSymbols

import { type InferSelectModel, relations } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text().primaryKey(),
  username: text().notNull().unique(),
  defaultDistribution: doublePrecision()
});
export type User = typeof user.$inferSelect;

export const userRelations = relations(user, ({ many }) => ({
  shoppingPurchases: many(shoppingPurchase) // Relation for one-to-many with shoppingPurchase
}));

export const shoppingCategory = pgTable('shopping_category', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  priority: integer().notNull()
});
export type ShoppingCategory = typeof shoppingCategory.$inferSelect;

export type ShoppingCategoryWithRelation = InferSelectModel<typeof shoppingCategory> & {
  shoppingItems: InferSelectModel<typeof shoppingItem>[];
};

export const shoppingCategoryRelations = relations(shoppingCategory, ({ many }) => ({
  shoppingItems: many(shoppingItem)
}));

export const shoppingItem = pgTable('shopping_item', {
  id: text().primaryKey(),
  categoryId: text().references(() => shoppingCategory.id),
  name: text().notNull().unique(),
  amount: text().notNull().default(''),
  priority: integer().notNull(),
  active: boolean().notNull()
});
export type ShoppingItem = typeof shoppingItem.$inferSelect;

export const shoppingItemRelations = relations(shoppingItem, ({ one, many }) => ({
  category: one(shoppingCategory, {
    fields: [shoppingItem.categoryId],
    references: [shoppingCategory.id]
  }),
  shoppingPurchases: many(shoppingPurchaseItem)
}));

export const shoppingPurchase = pgTable('shopping_purchase', {
  id: text().primaryKey(),
  date: timestamp().notNull(),
  userId: text().references(() => user.id)
});
export type ShoppingPurchase = typeof shoppingPurchase.$inferSelect;

export const shoppingPurchaseRelations = relations(shoppingPurchase, ({ one, many }) => ({
  user: one(user, {
    fields: [shoppingPurchase.userId],
    references: [user.id]
  }),
  shoppingItems: many(shoppingItem)
}));

// Junction table for many-to-many relationship between shoppingPurchase and shoppingItem
export const shoppingPurchaseItem = pgTable('shopping_purchase_item', {
    purchaseId: text().notNull().references(() => shoppingPurchase.id),
    itemId: text().notNull().references(() => shoppingItem.id)
  },
  (t) => [
    primaryKey({ columns: [t.purchaseId, t.itemId] })
  ]);
export type ShoppingPurchaseItem = typeof shoppingPurchaseItem.$inferSelect;

export const shoppingPurchaseItemRelations = relations(shoppingPurchaseItem, ({ one }) => ({
  shoppingPurchase: one(shoppingPurchase, {
    fields: [shoppingPurchaseItem.purchaseId],
    references: [shoppingPurchase.id]
  }),
  shoppingItem: one(shoppingItem, {
    fields: [shoppingPurchaseItem.itemId],
    references: [shoppingItem.id]
  })
}));

export const stagedShoppingPurchaseItem = pgTable('staged_shopping_purchase_item', {
  itemId: text().primaryKey().references(() => shoppingItem.id),
  userId: text().notNull().references(() => user.id)
});

export const stagedShoppingList = pgTable('staged_shopping_list', {
  id: text().primaryKey(),
  userId: text().notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  status: text({ enum: ['validating', 'categorizing'] }).notNull()
});
export type StagedShoppingList = typeof stagedShoppingList.$inferSelect;

export const stagedShoppingListRelations = relations(stagedShoppingList, ({ one, many }) => ({
  user: one(user, { fields: [stagedShoppingList.userId], references: [user.id] }),
  // One staged list has many staged items
  stagedItems: many(stagedShoppingItem)
}));

export const stagedShoppingItem = pgTable('staged_shopping_item', {
  id: text().primaryKey(),
  listId: text().notNull().references(() => stagedShoppingList.id, { onDelete: 'cascade' }),
  status: text({ enum: ['perfect_match', 'close_match', 'unmatched'] }).notNull(),
  name: text().notNull(),
  amount: text().notNull(),
  // FK to shopping_item, non-null only if status is 'perfect_match'
  matchedItemId: text().references(() => shoppingItem.id),
  // FK to shopping_item, non-null only if status is 'close_match'
  suggestedItemId: text().references(() => shoppingItem.id),
  // FK to shopping_category, non-null but must be set later in status 'unmatched'
  selectedCategoryId: text().references(() => shoppingCategory.id)
});
export type StagedShoppingItem = typeof stagedShoppingItem.$inferSelect;

export const stagedShoppingItemRelations = relations(stagedShoppingItem, ({ one }) => ({
  // Each staged item belongs to one staged list
  list: one(stagedShoppingList, { fields: [stagedShoppingItem.listId], references: [stagedShoppingList.id] }),
  // Link to the actual item if it was a perfect match
  matchedItem: one(shoppingItem, {
    fields: [stagedShoppingItem.matchedItemId],
    references: [shoppingItem.id],
    relationName: 'matchedItem' // Explicit name helps Drizzle distinguish
  }),
  // Link to the suggested item if it was a close match
  suggestedItem: one(shoppingItem, {
    fields: [stagedShoppingItem.suggestedItemId],
    references: [shoppingItem.id],
    relationName: 'suggestedItem' // Explicit name
  }),
  // Link to the selected category if it was already done by the user
  selectedCategory: one(shoppingCategory, {
    fields: [stagedShoppingItem.selectedCategoryId],
    references: [shoppingCategory.id],
    relationName: 'selectedCategory' // Explicit name
  })
}));

export const balanceEntry = pgTable('balance_entry', {
  id: text().primaryKey(),
  date: timestamp().notNull(),
  userId: text().notNull().references(() => user.id),
  price: integer().notNull(),
  name: text(),
  purchaseId: text().references(() => shoppingPurchase.id)
});
export type BalanceEntry = typeof balanceEntry.$inferSelect;

export const balanceEntryRelations = relations(balanceEntry, ({ one, many }) => ({
  user: one(user, { fields: [balanceEntry.userId], references: [user.id] }),
  distributions: many(balanceEntryDistribution)
}));

export const balanceEntryDistribution = pgTable('balance_entry_distribution', {
    entryId: text().notNull().references(() => balanceEntry.id),
    userId: text().notNull().references(() => user.id),
    percent: doublePrecision().notNull()
  },
  (t) => [
    primaryKey({ columns: [t.entryId, t.userId] })
  ]
);

export const balanceEntryDistributionRelations = relations(balanceEntryDistribution, ({ one }) => ({
  balanceEntry: one(balanceEntry, {
    fields: [balanceEntryDistribution.entryId],
    references: [balanceEntry.id]
  }),
  user: one(user, {
    fields: [balanceEntryDistribution.userId],
    references: [user.id]
  }),
}));

export const weekday = pgEnum('weekday', ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

export type Weekday = typeof weekday.enumValues[number];

// Define the tasks table
export const weeklyTask = pgTable('task_weekly', {
  id: text().primaryKey(),
  createdAt: timestamp().defaultNow().notNull(),
  name: text().notNull(),
  dueWeekday: weekday().notNull(),
  interval: integer().notNull().default(1),
  nextDueUserId: text().references(() => user.id, { onDelete: 'cascade' }),
  nextDueDate: date().notNull()
});
// Define TypeScript types for convenience (optional but recommended)
export type WeeklyTask = typeof weeklyTask.$inferSelect;

export type WeeklyTaskWithRelation = InferSelectModel<typeof weeklyTask> & {
  nextDueUser: InferSelectModel<typeof user> | null;
};

export const tasksRelations = relations(weeklyTask, ({ one }) => ({
  nextDueUser: one(user, { fields: [weeklyTask.nextDueUserId], references: [user.id] })
}));

export const taskCompletion = pgTable('task_completion', {
  id: text().primaryKey(),
  taskId: text().notNull().references(() => weeklyTask.id, { onDelete: 'cascade' }),
  userId: text().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: date().notNull()
});
export type TaskCompletion = typeof taskCompletion.$inferSelect;
