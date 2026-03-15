import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  // Intentamos obtener el token guardado en el Login
  const { value } = await Preferences.get({ key: 'token' });

  if (value && value !== null) {
    // Si hay token, el usuario está autenticado
    return true; 
  }

  // Si no hay token, lo mandamos al login y bloqueamos el acceso
  router.navigate(['/login']);
  return false;
};