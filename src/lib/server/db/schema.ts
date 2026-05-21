// noinspection JSUnusedGlobalSymbols The entities are referenced through svelte magic.

import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import {
  boolean, check,
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { Weekday } from '$lib/utils/taskHelper';

export const user = pgTable('user', {
  id: text().primaryKey(),
  username: text().notNull().unique(),
  password: text().notNull(),
  defaultDistribution: doublePrecision()
});
export type User = typeof user.$inferSelect;

export const userRelations = relations(user, ({ many }) => ({
  shoppingPurchases: many(shoppingPurchase)
}));

export const session = pgTable('session', {
  id: text().primaryKey(),
  userId: text().references(() => user.id).notNull(),
  expiresAt: timestamp().notNull(),
});
export type Session = typeof session.$inferSelect;

export const shoppingCategory = pgTable('shopping_category', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  priority: integer().notNull()
});
export type ShoppingCategory = typeof shoppingCategory.$inferSelect;

export type ShoppingCategoryWithRelation = InferSelectModel<typeof shoppingCategory> & {
  shoppingItems: (InferSelectModel<typeof shoppingItem> & {
    stagedPurchase: InferSelectModel<typeof stagedShoppingPurchaseItem>
  })[];
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
  stagedPurchase: one(stagedShoppingPurchaseItem, {
    fields: [shoppingItem.id],
    references: [stagedShoppingPurchaseItem.itemId]
  }),
  shoppingPurchases: many(shoppingPurchaseItem)
}));

export const shoppingPurchase = pgTable('shopping_purchase', {
  id: text().primaryKey(),
  date: timestamp().notNull(),
  userId: text().references(() => user.id).notNull(),
  balanceEntryId: text().references(() => balanceEntry.id),
});
export type ShoppingPurchase = typeof shoppingPurchase.$inferSelect;

export const shoppingPurchaseRelations = relations(shoppingPurchase, ({ one, many }) => ({
  user: one(user, {
    fields: [shoppingPurchase.userId],
    references: [user.id]
  }),
  balanceEntry: one(balanceEntry, {
    fields: [shoppingPurchase.balanceEntryId],
    references: [balanceEntry.id]
  }),
  shoppingItems: many(shoppingPurchaseItem)
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
  stagedItems: many(stagedShoppingItem)
}));

export const stagedShoppingItem = pgTable('staged_shopping_item', {
  id: text().primaryKey(),
  listId: text().notNull().references(() => stagedShoppingList.id, { onDelete: 'cascade' }),
  status: text({ enum: ['perfect_match', 'unmatched'] }).notNull(),
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
  name: text()
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

export const weekday = pgEnum('weekday', Weekday);

export const taskTypeEnum = pgEnum('task_type', ['single', 'repeating']);

export const task = pgTable('task', {
  id: text().primaryKey(),
  createdAt: timestamp().defaultNow().notNull(),
  type: taskTypeEnum().notNull(),
  name: text().notNull(),
  dueUserId: text().references(() => user.id, { onDelete: 'cascade' }),
  dueDate: date(),
  // Single specific
  done: boolean().default(false),
  // Repeating specific
  dueWeekday: weekday(),
  dueInterval: integer(),
}, (table) => ({
  taskStateCheck: check(
    'task_state_check',
    sql`
      (${table.type} = 'single' AND ${table.dueWeekday} IS NULL AND ${table.dueInterval} IS NULL)
      OR
      (${table.type} = 'repeating' AND ${table.dueWeekday} IS NOT NULL AND ${table.dueInterval} IS NOT NULL AND ${table.dueDate} IS NOT NULL)
    `
  )
}));

// ============================================================================
// TYPESCRIPT: STRICT DISCRIMINATED UNIONS
// ============================================================================

// type BaseTaskSelect = typeof task.$inferSelect;
// type BaseTaskInsert = typeof task.$inferInsert;

// Utility to extract the exact Weekday type inferred by Drizzle
// type WeekdayType = NonNullable<BaseTaskSelect['dueWeekday']>;

// // --- SELECT TYPES ---
// export type SingleTask = BaseTaskSelect & {
//   type: 'single';
//   dueWeekday: null; // Enforced null
//   interval: null;   // Enforced null
//   // dueDate is allowed to be string | null per your original singleTask
// };
//
// export type RepeatingTask = BaseTaskSelect & {
//   type: 'repeating';
//   dueDate: string;         // Enforced not null
//   dueWeekday: WeekdayType; // Enforced not null
//   interval: number;        // Enforced not null
// };
//
// // Use this type anywhere you query tasks!
// export type Task = SingleTask | RepeatingTask;
//
// // --- INSERT TYPES ---
// export type SingleTaskInsert = BaseTaskInsert & {
//   type: 'single';
//   dueWeekday?: null;
//   interval?: null;
// };
//
// export type RepeatingTaskInsert = BaseTaskInsert & {
//   type: 'repeating';
//   dueDate: string;
//   dueWeekday: WeekdayType;
//   interval: number; // No default at DB level anymore, so we require it on insert
// };
//
// export type TaskInsert = SingleTaskInsert | RepeatingTaskInsert;
//
// // ============================================================================
// // COMPLETIONS & RELATIONS
// // ============================================================================

export const taskCompletion = pgTable('task_completion', {
  id: text().primaryKey(),
  taskId: text().notNull().references(() => task.id, { onDelete: 'cascade' }),
  userId: text().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: date().notNull()
});

// export type TaskCompletion = typeof taskCompletion.$inferSelect;
//
// export const taskRelations = relations(task, ({ one, many }) => ({
//   dueUser: one(user, { fields: [task.dueUserId], references: [user.id] }),
//   completions: many(taskCompletion) // Technically repeating only, but tied to base table
// }));
//
// export const taskCompletionRelations = relations(taskCompletion, ({ one }) => ({
//   task: one(task, { fields: [taskCompletion.taskId], references: [task.id] }),
// }));
//
// // Strict generic relation type encompassing the discriminated union
// export type TaskWithRelation = Task & {
//   dueUser: InferSelectModel<typeof user> | null;
//   completions: TaskCompletion[];
// };


export const weeklyTask = pgTable('task_weekly', {
  id: text().primaryKey(),
  createdAt: timestamp().defaultNow().notNull(),
  name: text().notNull(),
  dueWeekday: weekday().notNull(),
  interval: integer().notNull().default(1),
  dueUserId: text().references(() => user.id, { onDelete: 'cascade' }),
  dueDate: date().notNull()
});
export type WeeklyTask = typeof weeklyTask.$inferSelect;

export type WeeklyTaskWithRelation = InferSelectModel<typeof weeklyTask> & {
  dueUser: InferSelectModel<typeof user> | null;
  completions: InferSelectModel<typeof weeklyTaskCompletion>[];
};

export const weeklyTasksRelations = relations(weeklyTask, ({ one, many }) => ({
  dueUser: one(user, { fields: [weeklyTask.dueUserId], references: [user.id] }),
  completions: many(weeklyTaskCompletion)
}));

export const weeklyTaskCompletion = pgTable('task_weekly_completion', {
  id: text().primaryKey(),
  taskId: text().notNull().references(() => weeklyTask.id, { onDelete: 'cascade' }),
  userId: text().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: date().notNull()
});
export type TaskCompletion = typeof weeklyTaskCompletion.$inferSelect;

export const weeklyTaskCompletionRelations = relations(weeklyTaskCompletion, ({ one }) => ({
  task: one(weeklyTask, { fields: [weeklyTaskCompletion.taskId], references: [weeklyTask.id] }),
}));

export const singleTask = pgTable('task_single', {
  id: text().primaryKey(),
  createdAt: timestamp().defaultNow().notNull(),
  name: text().notNull(),
  dueUserId: text().references(() => user.id, { onDelete: 'cascade' }),
  dueDate: date(),
  done: boolean().default(false).notNull(),
});
export type SingleTask = typeof singleTask.$inferSelect;

export const singleTasksRelations = relations(singleTask, ({ one }) => ({
  dueUser: one(user, { fields: [singleTask.dueUserId], references: [user.id] }),
}));

export type TaskWithRelation = {
  id: string;
  name: string;
  dueUser: InferSelectModel<typeof user> | null;
  dueDate: string | null;
  done?: boolean;
  completions?: InferSelectModel<typeof weeklyTaskCompletion>[];
};