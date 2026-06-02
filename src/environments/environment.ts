import packageInfo from '../../package.json'; // Ajusta la ruta para llegar al package.json

export const environment = {
  production: false,
  // API: 'https://v2.sigmod.mx/api',
  API: 'http://localhost:3000/api', //http://localhost:3000/api  https://api.disi.gob.mx/api
  prefijoLocalStorage: 'aragobel_dev',
  API_KEY:'6LdIDvYnAAAAAHRcRyi8swoYq2oBeMlbGYREl2G',
  API_EMAIL:'aragobel@gmail.com',

  // CONFIGURAMOS EL TEXTO PARA ESTE AMBIENTE:
  appVersion: `${packageInfo.version}-dev`, 
  appVersionCode: (packageInfo as any).versionCode
};
