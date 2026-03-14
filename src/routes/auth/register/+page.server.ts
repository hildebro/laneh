import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { Readable } from 'node:stream';
import zlib from 'node:zlib';
import tar from 'tar-stream';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { setSessionCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { addUser, createSession, findAllUsers, isUsernameTaken } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async () => {
  return {
    users: await findAllUsers()
  };
};

const minUsernameLength = 3;
const maxUsernameLength = 31;

const userSchema = z.object({
  username: z.string()
    .regex(/^[a-zA-Z0-9_-]*$/)
    .min(minUsernameLength)
    .max(maxUsernameLength),
  password: z.string().min(8).max(64)
});

const importSchema = z.object({
  dumpFile: z.file().mime(['application/gzip']).nonoptional()
});

export const actions: Actions = {
  register: async (event) => {
    return processForm(event, userSchema, async (user) => {
      if (await isUsernameTaken(user.username)) {
        return fail(422, {
          issues: [{ path: ['username'], message: m.auth_register_error_taken() }]
        });
      }

      const userId = await addUser(user.username, user.password);

      const users = await findAllUsers();
      if (users.length > 1) {
        return redirect(302, resolve('/settings/users'));
      }

      // If we only have a single user, we might as well log in and redirect to dashboard.
      const session = await createSession(userId);
      setSessionCookie(event.cookies, session);
      return redirect(302, resolve('/'));
    });
  },
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
      throw redirect(303, resolve('/auth'));
    })
  }
};
