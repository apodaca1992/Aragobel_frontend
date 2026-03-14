// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // API: 'https://v2.sigmod.mx/api',
  API: 'http://localhost:3000/api', //http://localhost:3000/api  https://api.disi.gob.mx/api
  prefijoLocalStorage: 'aragobel_dev',
  API_KEY:'6LdIDvYnAAAAAHRcRyi8swoYq2oBeMlbGYREl2G',
  API_EMAIL:'aragobel@gmail.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
