import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { Readable } from 'node:stream';
import zlib from 'node:zlib';
import tar from 'tar-stream';
import type { Actions } from './$types';
import { resolve } from '$app/paths';
import { db } from '$lib/server/db';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const importSchema = z.object({
  dumpFile: z.file().mime(['application/gzip']).nonoptional()
});

export const actions: Actions = {
  import: async (event) => {
    return processForm(event, importSchema, async (importFile) => {
      try {
        // 1. Convert the uploaded file to a Node Buffer
        const arrayBuffer = await importFile.dumpFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Extract the SQL queries from the tar.gz in memory
        const queries: string[] = [];

        await new Promise<void>((resolve, reject) => {
          const extract = tar.extract();

          extract.on('entry', (header, stream, next) => {
            // Only process our .sql files
            if (header.name.endsWith('.sql')) {
              let sqlContent = '';
              stream.on('data', (chunk) => {
                sqlContent += chunk;
              });
              stream.on('end', () => {
                if (sqlContent.trim()) queries.push(sqlContent);
                next();
              });
            } else {
              // Skip other files (like the error log if it exists)
              stream.on('end', () => next());
              stream.resume();
            }
          });

          extract.on('finish', () => resolve());
          extract.on('error', (err) => reject(err));

          // Pipe the buffer through gunzip and into the tar extractor
          Readable.from(buffer).pipe(zlib.createGunzip()).pipe(extract);
        });

        // 3. Execute all queries in a single transaction
        await db.transaction(async (tx) => {
          // Temporarily disable foreign key constraints and triggers for the import
          await tx.execute(sql`SET session_replication_role = replica;`);

          for (const query of queries) {
            // sql.raw allows us to execute the exact string we generated earlier
            await tx.execute(sql.raw(query));
          }

          // Re-enable constraints
          await tx.execute(sql`SET session_replication_role = origin;`);
        });
      } catch (error) {
        console.error('Import failed:', error);
        return fail(500, { error: 'Failed to import database. Check server logs.' });
      }

      // 4. Redirect to the dashboard or login page upon success
      return redirect(303, resolve('/login'));
    })
  }
};
