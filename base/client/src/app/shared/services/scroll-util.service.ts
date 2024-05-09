import { Injectable } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map, pairwise, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollUtilService {

  constructor() { }

  containerReachedTop(container: HTMLElement): Observable<boolean> {
    return fromEvent(container, 'scroll').pipe(
      map(() => container.scrollTop === 0)
    );
  }

  containerReachedBottom(container: HTMLElement): Observable<boolean> {
    return fromEvent(container, 'scroll').pipe(
      map(() => this.isAtBottom(container))
    );
  }

  private isAtBottom(container: HTMLElement): boolean {
    return container.scrollHeight - container.clientHeight <= container.scrollTop + 5;
    
  }
}
