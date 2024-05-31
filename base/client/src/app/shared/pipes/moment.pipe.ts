import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'moment',
  pure: false
})
export class MomentPipe implements PipeTransform , OnDestroy{

  private timer: any;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  transform(value: any): string {
    if (value) {
      const date = moment(value);
      const now = moment();
      const diffInMinutes = now.diff(date, 'minutes');
      
      if (diffInMinutes < 1) {
        return 'just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'min'} ago`;
      } else if (date.isSame(now, 'day')) {
        return date.format('h:mm A');
      } else if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
        return 'yesterday';
      } else if (date.isSame(now, 'year')) {
        return date.format('MMM D');
      } else {
        const diffInYears = now.diff(date, 'years');
        return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
      }
    }
    return '-';
  }

  private updateTimer(): void {
    this.timer = setInterval(() => {
      this.changeDetectorRef.markForCheck();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

}
