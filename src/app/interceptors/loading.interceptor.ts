// src/app/interceptors/loading.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Un Senior permite saltarse el loading si la petición lleva un header especial
    if (request.headers.has('skipLoading')) {
      // IMPORTANTE: Quitamos el header personalizado antes de enviar al servidor
      const cleanRequest = request.clone({ headers: request.headers.delete('skipLoading') });
      return next.handle(cleanRequest);
    }

    this.loadingService.show();

    return next.handle(request).pipe(
      finalize(() => {
        // finalize se ejecuta tanto en éxito como en error
        this.loadingService.hide();
      })
    );
  }
}