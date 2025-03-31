// src/lib/server/context.ts  (or wherever you prefer)
import { AsyncLocalStorage } from 'node:async_hooks';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type * as schema from './server/db/schema'; // Adjust path to your schema
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

// Define the type for the value stored in the context (our transactional client)
type TransactionalDbClient = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

// Create the AsyncLocalStorage instance
// This will hold the transactional DB client for the current request
export const transactionContext = new AsyncLocalStorage<TransactionalDbClient>();

// Helper function to safely get the transaction client from the context
export function getTx(): TransactionalDbClient {
  const tx = transactionContext.getStore();
  if (!tx) {
    // This error would typically mean getTx() was called outside the context
    // of a request wrapped by the hook, or before the hook ran.
    throw new Error(
      'Database transaction context is not available. Ensure this function runs within a request handled by the transaction hook.'
    );
  }
  return tx;
}