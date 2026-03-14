import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ToastService } from "@services/toast.service";
import { Observable, catchError, throwError } from "rxjs";

// src/app/interceptors/error.interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toast: ToastService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado';

        switch (error.status) {
          case 0:
            errorMessage = 'No hay conexión con el servidor.';
            break;
          case 401:
            errorMessage = 'Sesión expirada o inválida.';
            this.router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 422: // Errores de validación del backend
            errorMessage = error.error?.message || 'Datos inválidos';
            break;
        }

        this.toast.show(errorMessage);
        return throwError(() => error);
      })
    );
  }
}