import { Directive, HostListener, Input } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Directive({
  selector: '[appClickToCopy]'
})
export class ClickToCopyDirective {
  @Input() textToCopy: string = '';

  constructor(private readonly notifiService: NotificationService) {}

  @HostListener('click')
  onClick() {
    this.copyTextToClipboard(this.textToCopy);
  }

  private async copyTextToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.notifiService.showInfo('Text copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textField = document.createElement('textarea');
      textField.style.position = 'fixed';
      textField.style.opacity = '0';
      textField.value = text;
      document.body.appendChild(textField);
      textField.select();
      document.execCommand('copy');
      textField.remove();
      this.notifiService.showInfo('Text copied to clipboard!');
    }
  }
}
