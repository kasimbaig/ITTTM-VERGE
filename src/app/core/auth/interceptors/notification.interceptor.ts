import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable()
export class NotificationInterceptor implements HttpInterceptor {
  constructor(private messageService: MessageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const method = request.method.toUpperCase();
    const isMutating = method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';

    return next.handle(request).pipe(
      tap((event) => {
        if (!isMutating) return;
        if (event instanceof HttpResponse) {
          const body = event.body as any;
          const successMessage = (body && (body.message || body.detail)) || 'Operation successful';
          const status=(body && (body.status || body.status)) || 1
          if(status==1){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
          }else{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: successMessage });
          }

        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (isMutating) {
          const serverError = error?.error as any;
          let detail = 'An error occurred';
          if (serverError) {
            if (typeof serverError === 'string') {
              detail = serverError;
            } else if (serverError.message) {
              detail = serverError.message;
            } else if (serverError.detail) {
              detail = serverError.detail;
            }
          } else if (error.message) {
            detail = error.message;
          }
          this.messageService.add({ severity: 'error', summary: detail || 'Some thing went wrong' });
        }
        return throwError(() => error);
      })
    );
  }
}


