import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ocurrió un error inesperado.';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMsg = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMsg = error.error?.message || 'Solicitud incorrecta. Verifique los datos enviados.';
            break;
          case 401:
            errorMsg = 'No autorizado. Por favor inicie sesión nuevamente.';
            break;
          case 403:
            errorMsg = 'No tiene permisos para realizar esta acción.';
            break;
          case 404:
            errorMsg = 'Recurso no encontrado.';
            break;
          case 500:
            errorMsg = 'Error interno del servidor. Intente más tarde.';
            break;
          default:
            errorMsg = error.error?.message || `Error del servidor: ${error.status}`;
            break;
        }
      }

      toastService.error(errorMsg);
      return throwError(() => error);
    })
  );
};
