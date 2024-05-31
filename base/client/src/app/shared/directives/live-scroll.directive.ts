import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[liveScroll]'
})
export class LiveScrollDirective {

  @Output() scrolledBottom = new EventEmitter<boolean>();

  @HostListener('scroll', ['$event.target'])
  onScroll(target: HTMLElement): void {
    const scrollPosition = Math.ceil(target.scrollTop + target.clientHeight);
    const totalHeight = target.scrollHeight;
    
    if (scrollPosition === totalHeight) {
      this.scrolledBottom.emit(true);
    }
  }

}
