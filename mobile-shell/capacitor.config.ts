import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAP_SERVER_URL;

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
    cleartext: true,
    ...(devServerUrl && { url: devServerUrl })
  },
  android: {
    allowMixedContent: true
  }
};

export default config;