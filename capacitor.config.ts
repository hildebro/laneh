import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.laneh.app',
  appName: 'Laneh',
  webDir: 'build',
  server: {
    url: 'http://192.168.178.75:5173',
    cleartext: true // Required since you are using HTTP, not HTTPS
  }
};

export default config;
