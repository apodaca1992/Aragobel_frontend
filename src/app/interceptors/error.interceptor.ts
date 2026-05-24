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
      // 🔍 Extraemos el mensaje dinámico del backend si es que existe
      const backendMessage = error.error?.message || error.error?.error;
      let errorMessage = 'Ocurrió un error inesperado';

      // Lógica Senior Optimizada: Manejo dinámico de estados HTTP
      switch (error.status) {
        case 0:
          errorMessage = 'No hay conexión con el servidor.';
          break;
        case 400:
          // Captura errores de solicitudes incorrectas (ej. "Ya existe un registro")
          errorMessage = backendMessage || 'Solicitud incorrecta.';
          break;
        case 401:
          errorMessage = 'Sesión expirada o inválida.';
          // Si el token no sirve, limpiamos y mandamos al login
          router.navigate(['/login'], { replaceUrl: true });
          break;
        case 403:
          // 🔒 🎯 Aquí cae tu error de distancia. Si el backend manda un mensaje, lo usamos.
          errorMessage = backendMessage || 'No tienes permisos para realizar esta acción.';
          break;
        case 422:
          errorMessage = backendMessage || 'Datos inválidos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente más tarde.';
          break;
      }

      // Mostramos el mensaje visual único al usuario
      toast.show(errorMessage, 'danger', 'alert-circle-outline');

      // Propagamos el error por si el componente necesita apagar loaders o variables de bloqueo
      return throwError(() => error);
    })
  );
};