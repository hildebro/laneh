import { getTableColumns, getTableName, type Table } from 'drizzle-orm';
import { PassThrough, Readable } from 'node:stream';
import { createGzip } from 'node:zlib';
import tar from 'tar-stream';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

function escapeSqlValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);

  // Format Dates to ISO strings for Postgres
  if (val instanceof Date) return `'${val.toISOString()}'`;

  // Escape single quotes by doubling them (standard SQL)
  return `'${String(val).replace(/'/g, '\'\'')}'`;
}

function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export async function GET() {
  const pack = tar.pack();
  const gzip = createGzip();

  // Create a PassThrough stream to bridge Node streams to Web streams
  const passThrough = new PassThrough();

  // Pipe the tar stream through gzip, then to the passthrough
  pack.pipe(gzip).pipe(passThrough);

  // Helper to append entries as Promises for proper backpressure handling
  const appendEntry = (name: string, content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      pack.entry({ name }, content, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  // Process tables asynchronously without blocking the stream
  const processTables = async () => {
    try {
      for (const [, entity] of Object.entries(schema)) {
        // Try to get the table name. If it fails or returns undefined, it's not a table (e.g., it's
        // a relation or enum).
        let tableName: string;
        try {
          tableName = getTableName(entity as Table);
        } catch {
          continue;
        }

        if (!tableName) continue;

        // Fetch all rows for this dynamic table
        const rows = await db.select().from(entity as Table);

        if (rows.length === 0) {
          await appendEntry(`${tableName}.sql`, '-- No data\n');
          continue;
        }

        const tableCols = getTableColumns(entity as Table);

        let sql = `-- Dump for table: ${tableName}\n\n`;

        // Convert the JS keys back to their snake_case DB equivalents
        const columns = Object.keys(rows[0])
          .map((jsKey) => {
            const col = tableCols[jsKey];
            // If Drizzle has a specific name for this column, use it (and snake_case it just in case)
            // Otherwise, just snake_case the TypeScript key directly.
            const dbColName = col?.name ? toSnakeCase(col.name) : toSnakeCase(jsKey);

            return `"${dbColName}"`;
          })
          .join(', ');

        for (const row of rows) {
          const values = Object.values(row).map(escapeSqlValue).join(', ');
          sql += `INSERT INTO "${tableName}" (${columns})
                  VALUES (${values});  \n`;
        }

        await appendEntry(`${tableName}.sql`, sql);
      }
    } catch (error) {
      console.error('Export error:', error);
      await appendEntry('error.log', 'ERROR GENERATING DUMP');
    } finally {
      // Finalize the tar stream to end it, which will propagate to gzip and passThrough
      pack.finalize();
    }
  };

  // Start processing in the background
  // noinspection ES6MissingAwait
  processTables();

  // Convert Node stream to Web Stream for SvelteKit Response
  const webStream = Readable.toWeb(passThrough) as ReadableStream;

  const now = new Date();
  const Y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const H = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${Y}${m}${d}-${H}${min}`;

  return new Response(webStream, {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="chorehub-${__APP_VERSION__}-db-${timestamp}.tar.gz"`
    }
  });
}
