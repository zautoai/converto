import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-oauth-button',
  templateUrl: './oauth-button.component.html',
  styleUrls: ['./oauth-button.component.scss']
})
export class OAuthButtonComponent {

  @Input()provider:string | null = null;
  @Input()text:string | null = null;
  @Input()icon:string | null = null;

  @Output() clickEventEmitter: EventEmitter<string> = new EventEmitter();

  onClick(provider: any) {
    this.clickEventEmitter.emit(provider);
  }
}
