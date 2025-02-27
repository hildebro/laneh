import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
});
export type User = typeof user.$inferSelect;

export const shoppingCategory = pgTable('shopping_category', {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    priority: integer('priority').notNull().unique(),
});
export type ShoppingCategory = typeof shoppingCategory.$inferSelect;
