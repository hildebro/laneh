import { boolean, integer, pgTable, primaryKey, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const user = pgTable('user', {
  id: text().primaryKey(),
  username: text().notNull().unique()
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
}, (shoppingItem) => [
  unique().on(shoppingItem.categoryId, shoppingItem.priority)
]);
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
  matchedItemId: text('matched_item_id').references(() => shoppingItem.id),
  // FK to shopping_item, non-null only if status is 'close_match'
  suggestedItemId: text('suggested_item_id').references(() => shoppingItem.id)
});
export type StagedShoppingItem = typeof stagedShoppingItem.$inferSelect;

export type StagedItemForValidation = StagedShoppingItem & { status: 'close_match'; suggestedItemId: string };
export type StagedItemForCategorization = StagedShoppingItem & { status: 'unmatched' };
export type StagedItemPerfectMatch = StagedShoppingItem & { status: 'perfect_match'; matchedItemId: string };

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
  })
}));
