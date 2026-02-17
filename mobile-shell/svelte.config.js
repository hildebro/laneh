import adapter from '@sveltejs/adapter-static';

const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // Essential for Single Page App (SPA) routing
			precompress: false,
			strict: true
		})
	}
};

export default config;