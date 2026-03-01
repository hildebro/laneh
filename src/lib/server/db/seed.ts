import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { systemState } from '$lib/server/db/schema';

export async function seed() {
  await db.transaction(async (tx) => {
    const seedEntries = await tx
      .select()
      .from(systemState)
      .where(eq(systemState.key, 'database_seeded'))
      .execute();

    if (seedEntries.length > 0) {
      console.log('App already seeded. Skipping initial inserts.');
      return;
    }

    console.log('Performing initial database seed...');

    // Track the fact that seeding is complete.
    await tx.insert(systemState).values({
      key: 'database_seeded',
      value: 'true',
      updatedAt: new Date()
    });

    console.log('Initial seed finished and flagged as complete.');
  })
}
