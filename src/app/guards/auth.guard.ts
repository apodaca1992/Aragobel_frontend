import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PreferencesService } from '@services/preference.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  // Inyectamos tu servicio de preferencias
  const preferenceService = inject(PreferencesService);

  // Intentamos obtener el token guardado en el Login
  const token = await preferenceService.getItem('token');

  if (token && token !== null) {
    // Si hay token, el usuario está autenticado
    return true; 
  }

  // Si no hay token, lo mandamos al login y bloqueamos el acceso
  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};