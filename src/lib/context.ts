import { type ExtractTablesWithRelations, sql } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PgliteQueryResultHKT } from 'drizzle-orm/pglite';
import type * as schema from '$lib/backend/db/schema';

// Define the type for the value stored in the context (our transactional client)
type TransactionalDbClient = PgTransaction<PgliteQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

// Subset of node's AsyncLocalStorage, so the server can use the real thing while the local app uses SerialContext.
export interface TransactionContext<T> {
  getStore(): T | undefined;

  run<R>(store: T, callback: () => Promise<R>): Promise<R>;
}

// Browser replacement for AsyncLocalStorage. Without async context tracking, the store can only be trusted while a
// single callback is running, so callbacks are queued and executed one after another.
export class SerialContext<T> implements TransactionContext<T> {
  private store: T | undefined;
  private queue: Promise<unknown> = Promise.resolve();

  getStore(): T | undefined {
    return this.store;
  }

  run<R>(store: T, callback: () => Promise<R>): Promise<R> {
    const result = this.queue.then(async () => {
      this.store = store;
      try {
        return await callback();
      } finally {
        this.store = undefined;
      }
    });

    // Keep the queue going, even if a callback fails.
    this.queue = result.catch(() => {});

    return result;
  }
}

// This will hold the transactional DB client for the current request. Injected by the runtime.
let transactionContext: TransactionContext<TransactionalDbClient> | undefined;

export function setTransactionContext(context: TransactionContext<TransactionalDbClient>) {
  transactionContext = context;
}

export function runInTransactionContext<R>(tx: TransactionalDbClient, callback: () => Promise<R>): Promise<R> {
  if (!transactionContext) {
    throw new Error('Transaction context is not initialized. Call setTransactionContext() before handling requests.');
  }

  return transactionContext.run(tx, callback);
}

// Helper function to safely get the transaction client from the context
export function getTx(): TransactionalDbClient {
  const tx = transactionContext?.getStore();
  if (!tx) {
    // This error would typically mean getTx() was called outside the context
    // of a request wrapped by the hook, or before the hook ran.
    throw new Error(
      'Database transaction context is not available. Ensure this function runs within a request handled by the transaction hook.'
    );
  }

  return tx;
}

export async function getAdminTx(): Promise<TransactionalDbClient> {
  const tx = getTx();

  await tx.execute(sql`RESET ROLE`);
  await tx.execute(sql`SET LOCAL row_security = 'off'`);

  return tx;
}
