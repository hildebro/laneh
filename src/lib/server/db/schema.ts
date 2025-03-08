import { integer, pgTable, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const user = pgTable('user', {
    id: text().primaryKey(),
    username: text().notNull().unique(),
});
export type User = typeof user.$inferSelect;

export const shoppingCategory = pgTable('shopping_category', {
    id: text().primaryKey(),
    name: text().notNull().unique(),
    priority: integer().notNull().unique(),
});
export type ShoppingCategory = typeof shoppingCategory.$inferSelect;

export const shoppingCategoryRelations = relations(shoppingCategory, ({ many }) => ({
	shoppingItems: many(shoppingItem),
}));

export const shoppingItem = pgTable('shopping_item', {
    id: text().primaryKey(),
    categoryId: text().references(() => shoppingCategory.id),
    name: text().notNull().unique(),
    priority: integer().notNull(),
}, (shoppingItem) => [
	unique().on(shoppingItem.categoryId, shoppingItem.priority),
]);
export type ShoppingItem = typeof shoppingItem.$inferSelect;

export const shoppingItemRelations = relations(shoppingItem, ({ one }) => ({
	category: one(shoppingCategory, {
		fields: [shoppingItem.categoryId],
		references: [shoppingCategory.id],
	}),
}));