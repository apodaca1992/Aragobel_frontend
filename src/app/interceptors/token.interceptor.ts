import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Obtenemos el token de Preferences (es una Promise, por eso usamos 'from' y 'switchMap')
  return from(Preferences.get({ key: 'token' })).pipe(
    switchMap((res) => {
      const token = res.value;

      // 2. Si hay token, clonamos la petición y le añadimos el Header
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}` // O el formato que pida tu API
          }
        });
        return next(authReq);
      }

      // 3. Si no hay token, mandamos la petición original
      return next(req);
    })
  );
};