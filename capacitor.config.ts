import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sakayori.llmtranslator',
  appName: 'LLM Translator',
  webDir: 'dist',
  android: {
    path: 'packaging/android/android',
  },
};

export default config;
