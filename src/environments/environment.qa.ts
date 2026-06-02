import packageInfo from '../../package.json'; // Ajusta la ruta para llegar al package.json

export const environment = {
  production: true,
  API: 'https://aragobel-backend-qa-424137532274.us-central1.run.app/api', 
  prefijoLocalStorage: 'aragobel_qa',
  API_KEY:'',
  API_EMAIL:'',

  // CONFIGURAMOS EL TEXTO PARA ESTE AMBIENTE:
  appVersion: `${packageInfo.version}-qa`, 
  appVersionCode: (packageInfo as any).versionCode
};
