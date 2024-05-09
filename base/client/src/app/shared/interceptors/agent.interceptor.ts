import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AgentInterceptor implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap((event: HttpEvent<any>) => {
                
                if (event instanceof HttpResponse && request.url.includes('/api/agents')) {
                    if(event.status == 200 && event.body && event.body.status != undefined)
                    {
                        if (event.body.status !== "ACTIVE") {
                            // this.router.navigate(['/auth/login']);
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
