import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aragobel.controlfacil', // Tu paquete único de Android
  appName: 'ControlFacil',
  webDir: 'www',
  server: {
    androidScheme: 'https' // Este es el que debe coincidir con tu CORS
  }
};

export default config;
