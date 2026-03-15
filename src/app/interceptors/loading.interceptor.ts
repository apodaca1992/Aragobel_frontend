import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const loadingService = inject(LoadingService);

  // 1. Verificamos si debemos saltar el loading
  if (req.headers.has('skipLoading')) {
    const cleanRequest = req.clone({ headers: req.headers.delete('skipLoading') });
    return next(cleanRequest);
  }

  // 2. Mostramos el loading
  loadingService.show();

  // 3. Usamos finalize para asegurar que SIEMPRE se oculte, incluso si la petición se cancela (Abort)
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};