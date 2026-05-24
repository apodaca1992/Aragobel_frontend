import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PreferencesService } from '@services/preference.service';
import { AuthService } from '@services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const preferenceService = inject(PreferencesService);
  const authService = inject(AuthService);

  // 1. Solo necesitamos el token para validar la caducidad
  const token = await preferenceService.getItem('token');

  if (token && token !== null) {
    try {
      // 2. Validamos la expiración del JWT (15 horas)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      const expirationTimeInSeconds = payload.exp;
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);

      if (currentTimeInSeconds < expirationTimeInSeconds) {
        
        // 3. Si el usuario abre la app desde la raíz ('') o intenta ir al login estando logueado:
        if (state.url === '/' || state.url.includes('/login')) {
          // El servicio se encarga de revisar la tienda, roles, permisos y mandarlo a donde debe 🚀
          await authService.redireccionarSegunPerfil();
          return false; // Cancelamos la ruta raíz o login original
        }
        
        return true; // Permitimos continuar si ya va a una ruta interna válida (ej: /checador)
      }
      
      // Si el token expiró, limpiamos el almacenamiento
      await preferenceService.removeItem('token');
    } catch (error) {
      await preferenceService.removeItem('token');
    }
  }

  // 4. Si no hay token o expiró, va directo al login
  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};