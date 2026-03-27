import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aragobel',
  appName: 'AragobelFrontend',
  webDir: 'www',
  server: {
    androidScheme: 'http' // Este es el que debe coincidir con tu CORS
  },
  plugins: {
    /*SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#9D19D2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: false,
      splashImmersive: false,
      layoutName: "launch_screen",
      useDialog: false,
    },
    StatusBar: {
      style: 'DARK', // o 'LIGHT'
    },*/
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'angular-sqlite-app-starter',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle : "Biometric login for capacitor sqlite"
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth : false,
        biometricTitle : "Biometric login for capacitor sqlite",
        biometricSubTitle : "Log in using your biometric"
      },
      electronIsEncryption: false,
      electronWindowsLocation: "C:\\ProgramData\\CapacitorDatabases",
      electronMacLocation: "/Volumes/Development_Lacie/Development/Databases",
      electronLinuxLocation: "Databases"
    }
  },
};

export default config;
