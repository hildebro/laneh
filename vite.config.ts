import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss(),
    paraglide({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
    }),
  ],
  server: {
    fs: {
      allow: [
        '.',
        process.env.XDG_CACHE_HOME
          ? path.join(process.env.XDG_CACHE_HOME, 'yarn/berry/cache/')
          : path.join(process.env.HOME || '~', '.cache/yarn/berry/cache/'),
        path.resolve(__dirname, './.yarn/.cache'),
      ],
    },
  },
});
