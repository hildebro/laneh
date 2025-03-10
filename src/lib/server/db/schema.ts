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
  priority: integer().notNull().unique()
});
export type ShoppingCategory = typeof shoppingCategory.$inferSelect;

export const shoppingCategoryRelations = relations(shoppingCategory, ({ many }) => ({
  shoppingItems: many(shoppingItem)
}));

export const shoppingItem = pgTable('shopping_item', {
  id: text().primaryKey(),
  categoryId: text().references(() => shoppingCategory.id),
  name: text().notNull().unique(),
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
