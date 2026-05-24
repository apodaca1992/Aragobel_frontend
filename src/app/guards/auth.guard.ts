import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PreferencesService } from '@services/preference.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const preferenceService = inject(PreferencesService);

  // 1. Intentamos obtener el token guardado
  const token = await preferenceService.getItem('token');

  if (token && token !== null) {
    try {
      // 2. Decodificamos el payload del JWT (la parte central del token)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // 3. Obtenemos la expiración del token ('exp' viene en segundos)
      const expirationTimeInSeconds = payload.exp;
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);

      // 4. Validamos si el token aún no ha expirado
      if (currentTimeInSeconds < expirationTimeInSeconds) {
        // ¡El token es válido! Permitimos el acceso a la ruta 🎉
        return true;
      }
      
      // Si el tiempo actual superó al de expiración, el token ya no sirve.
      // Limpiamos el almacenamiento para no dejar basura.
      await preferenceService.removeItem('token');

    } catch (error) {
      // Si el token está corrupto, alterado o da error al decodificar,
      // lo borramos por seguridad.
      await preferenceService.removeItem('token');
    }
  }

  // 5. Si no hay token o ya expiró, redirigimos al login y bloqueamos el paso
  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};