import packageInfo from '../../package.json'; // Ajusta la ruta para llegar al package.json

export const environment = {
  production: true,
  API: 'https://aragobel-backend-424137532274.us-central1.run.app/api', 
  prefijoLocalStorage: 'aragobel_prod',
  API_KEY:'',
  API_EMAIL:'',

  // CONFIGURAMOS EL TEXTO LIMPIO PARA PRODUCCIÓN:
  appVersion: packageInfo.version, 
  appVersionCode: (packageInfo as any).versionCode
};
