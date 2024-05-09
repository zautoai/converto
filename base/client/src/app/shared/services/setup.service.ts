import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { API } from 'src/app/config/endpoint.config';

@Injectable({
  providedIn: 'root'
})
export class SetupService {

  private setupDetails$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private isSetupCompleted$: BehaviorSubject<boolean>;

  private readonly IS_SETUP_COMPLETED_KEY = 'isSetupCompleted';

  constructor(private readonly restService: RestService) {
    this.isSetupCompleted$ = new BehaviorSubject<boolean>(this.getStoredSetupStatus());
    this.fetchSetupDetails();
  }

  private fetchSetupDetails(): void {
    this.restService.getAll(API.main.verify).subscribe(
      (setupDetails: any) => {
        this.setupDetails$.next(setupDetails);
        this.updateSetupStatus(!!setupDetails.avatar);
      },
      (error) => {
        console.error('Error fetching setup details:', error);
      }
    );
  }

  private getStoredSetupStatus(): boolean {
    const storedStatus = localStorage.getItem(this.IS_SETUP_COMPLETED_KEY);
    return storedStatus ? JSON.parse(storedStatus) : false;
  }

  private updateSetupStatus(isCompleted: boolean): void {
    this.isSetupCompleted$.next(isCompleted);
    localStorage.setItem(this.IS_SETUP_COMPLETED_KEY, JSON.stringify(isCompleted));
  }

  getSetupDetails(): Observable<any> {
    return this.setupDetails$.asObservable();
  }

  isSetupCompleted(): Observable<boolean> {
    return this.isSetupCompleted$.asObservable();
  }

  markSetupCompleted(): void {
    this.updateSetupStatus(true);
  }

  markSetupNotCompleted(): void {
    this.updateSetupStatus(false);
  }
}
