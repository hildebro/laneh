import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.chorehub.app',
	appName: 'Chorehub',
	webDir: 'build',
	plugins: {
		CapacitorHttp: {
			enabled: true // Intercepts fetch() and routes it natively
		}
	},
	server: {
		allowNavigation: ['*'],
		cleartext: true
	},
	android: {
		allowMixedContent: true
	}
};

export default config;