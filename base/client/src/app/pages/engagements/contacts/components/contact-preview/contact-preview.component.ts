import { Component, Input } from '@angular/core';
import { getCountryFlagClass } from '../../contact.utils';

@Component({
  selector: 'app-contact-preview',
  templateUrl: './contact-preview.component.html',
  styleUrl: './contact-preview.component.scss'
})
export class ContactPreviewComponent {

  @Input() contact:any;

  getCountryFlagClass(countryCode: string): string {
    return getCountryFlagClass(countryCode);
  }
}
