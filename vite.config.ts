import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

export default defineConfig({
  plugins: [
    sveltekit(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['localStorage', 'preferredLanguage', 'baseLocale']
    })
  ],
  server: {
    fs: {
      allow: [
        '.',
        process.env.XDG_CACHE_HOME
          ? path.join(process.env.XDG_CACHE_HOME, 'yarn/berry/cache/')
          : path.join(process.env.HOME || '~', '.cache/yarn/berry/cache/'),
        path.resolve(__dirname, './.yarn/.cache')
      ]
    },
    cors: {
      // Ensure all possible Capacitor origins are allowed by Vite
      origin: ['capacitor://localhost', 'http://localhost', 'https://localhost'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['x-refreshed-token']
    }
  },
  // PGlite loads its wasm and data files relative to its own module, which breaks when vite pre-bundles it.
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },
  build: {
    // The mobile build bundles the local backend (PGlite + drizzle) into one lazy chunk. It's loaded from the app
    // package, not over the network, so its size doesn't matter.
    chunkSizeWarningLimit: isCapacitor ? 1024 : 500,
    rollupOptions: {
      // SvelteKit replaces onwarn, so filtering has to happen in onLog.
      onLog(level, log, handler) {
        // PGlite ships an eval-based loader and a node file system module, which is never used in the browser.
        const fromPglite = log.id?.includes('@electric-sql/pglite');
        if (fromPglite && (log.code === 'EVAL' || log.code === 'MISSING_EXPORT')) {
          return;
        }

        handler(level, log);
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __CAPACITOR_BUILD__: JSON.stringify(isCapacitor)
  }
});
