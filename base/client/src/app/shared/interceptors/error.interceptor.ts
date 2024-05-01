import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notifiService:NotificationService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            this.router.navigate(['/auth/login']);
            console.error('HTTP Error:', error);
        }
        else if(error.status >= 500 && error.status <= 600)
        {
          this.notifiService.showError('Oops! Something went wrong on our end. Please try again later.' );
        }
        return throwError(error);
      })
    );
  }
}
