import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SetupService } from '../services/setup.service';
import { Observable, filter, map, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate {
  constructor(
    private setupService: SetupService,
    private router: Router
  ) { }
  canActivate(): Observable<boolean> {
    return this.setupService.isSetupCompleted().pipe(
      map((isCompleted: boolean) => {
        if (!isCompleted) {
          this.router.navigate(['/setup']);
          return false;
        }
        return true;
      })
    );
  }
}