import { Component, Input } from '@angular/core';
import { ButtonTypes } from '../types';

@Component({
  selector: 'advanced-button',
  templateUrl: './advanced-button.component.html',
  styleUrl: './advanced-button.component.scss'
})
export class AdvancedButtonComponent {

  @Input() label: string = '';
  @Input() size: string = 'sm';
  @Input() color: string = 'primary';
  @Input() icon: string = '';
  @Input() type: ButtonTypes = 'button';
  @Input() classes: string = '';
  @Input() isDisabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() loadingText: string = 'Loading...';

}
