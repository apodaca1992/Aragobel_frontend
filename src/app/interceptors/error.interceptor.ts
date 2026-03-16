import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { ToastService } from "@services/toast.service";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      // Lógica Senior: Manejo de estados HTTP
      switch (error.status) {
        case 0:
          errorMessage = 'No hay conexión con el servidor.';
          break;
        case 401:
          errorMessage = 'Sesión expirada o inválida.';
          // Si el token no sirve, limpiamos y mandamos al login
          router.navigate(['/login'], { replaceUrl: true });
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente más tarde.';
          break;
      }

      // Mostramos el mensaje visual al usuario
      toast.show(errorMessage, 'danger', 'bug-outline');

      // Propagamos el error por si el componente necesita manejar algo específico
      return throwError(() => error);
    })
  );
};