/// <reference types="@capacitor/background-runner" />
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
    },
    // Polls the server for notifications. Android runs it at most every 15 minutes, even while the app is closed.
    BackgroundRunner: {
      label: 'dev.laneh.app.notifications',
      src: 'runners/notifications.js',
      event: 'checkNotifications',
      repeat: true,
      interval: 15,
      autoStart: true
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
