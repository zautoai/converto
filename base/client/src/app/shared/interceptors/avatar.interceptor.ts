import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AvatarInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
        tap((event: HttpEvent<any>) => {
          
          if (event instanceof HttpResponse && request.url.includes('/api/auth/verify')) {
                if(event.status == 200 && event.body)
                {                  
                  if(event.body.avatar && event.body.avatar.status == "ACTIVE")
                  {
                    if(this.router.url == '/setup')
                    {
                      this.router.navigate(['/dashboard']);
                    }
                    
                  }
                  else
                  {
                    this.router.navigate(['/setup']);
                  }
                }
                
            }
        }),
        catchError((error: any) => {

            return throwError(error);
        })
    );
}
}
