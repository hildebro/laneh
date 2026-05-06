import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.laneh.app',
  appName: 'Laneh',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

if (process.env.CAP_LIVE_RELOAD === 'true') {
  config.server = {
    ...config.server,
    url: process.env.CAP_SERVER_URL
  };
}

export default config;
