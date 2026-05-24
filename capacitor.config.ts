import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aragobel.controlfacil', // Tu paquete único de Android
  appName: 'ControlFacil',
  webDir: 'www',
  server: {
    androidScheme: 'https' // Este es el que debe coincidir con tu CORS
  },
  // 👈 Añade este bloque de configuración
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,         // Duración en milisegundos (2 segundos)
      launchAutoHide: true,             // Se oculta automáticamente
      backgroundColor: "#003399",       // Color de fondo subyacente (usa tu color de marca)
      androidScaleType: "CENTER_CROP",
      showSpinner: false                // Opcional: true si quieres un círculo de carga nativo
    }
  }
};

export default config;
