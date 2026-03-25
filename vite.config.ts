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

export default defineConfig({
  plugins: [
    sveltekit(),
    paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
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
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  }
});
