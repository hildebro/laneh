import { getTableColumns, getTableName, type Table } from 'drizzle-orm';
import * as schema from '$lib/backend/db/schema';
import { createTarGz } from '$lib/backend/db/tar';
import { isOfflineRuntime } from '$lib/backend/runtime';
import { getAdminTx } from '$lib/context';

// Metadata about the instance that created a dump. The import only runs .sql files, so it doesn't interfere.
export const DUMP_MANIFEST_FILE = 'manifest.json';

export type DumpManifest = {
  version: string;
  // Offline dumps contain a dummy household and user, which might need special handling on import.
  offline: boolean;
};

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

export async function generateDatabaseBackup() {
  const files: { name: string; content: string }[] = [];

  // Everything is read before responding, since the request transaction closes afterward.
  for (const [, entity] of Object.entries(schema)) {
    let tableName: string;
    try {
      tableName = getTableName(entity as Table);
    } catch {
      continue;
    }

    // system_store is automatically populated, so no need to export.
    if (!tableName || tableName === 'system_store') {
      continue;
    }

    const tx = await getAdminTx();
    const rows = await tx.select().from(entity as Table);

    if (rows.length === 0) {
      continue;
    }

    const tableCols = getTableColumns(entity as Table);

    // Convert the JS keys back to their snake_case DB equivalents
    const columns = Object.keys(rows[0])
      .map((jsKey) => {
        const col = tableCols[jsKey];
        const dbColName = col?.name ? toSnakeCase(col.name) : toSnakeCase(jsKey);
        return `"${dbColName}"`;
      })
      .join(', ');

    // Map all rows into grouped value strings with indentation
    const allValues = rows.map((row) => {
      return `  (${Object.values(row).map(escapeSqlValue).join(', ')})`;
    }).join(',\n'); // Add a newline after each row

    // Create exactly ONE massive INSERT statement per table, properly formatted
    const sql = `INSERT INTO "${tableName}" (${columns}) VALUES\n${allValues};\n`;

    files.push({ name: `${tableName}.sql`, content: sql });
  }

  const manifest: DumpManifest = { version: __APP_VERSION__, offline: isOfflineRuntime() };
  files.push({ name: DUMP_MANIFEST_FILE, content: JSON.stringify(manifest, null, 2) });

  const archive = await createTarGz(files);

  // Generate filename timestamp
  const now = new Date();
  const Y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const H = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${Y}${m}${d}-${H}${min}`;

  const filename = `laneh-${__APP_VERSION__}-db-${timestamp}.tar.gz`;

  return { archive, filename };
}
