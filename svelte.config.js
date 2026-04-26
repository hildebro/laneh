import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Check if we are building for mobile (Capacitor)
const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: isCapacitor
      ? adapterStatic({
        pages: 'build',
        assets: 'build',
        fallback: 'index.html',
        precompress: false,
        strict: true
      })
      : adapterNode(),
    csrf: {
      checkOrigin: true,
      trustedOrigins: [
        'capacitor://localhost',
        'http://localhost',
        'https://localhost',
      ]
    }
  }
};

export default config;
