import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getCountryFlagClass } from '../../contact.utils';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.scss'
})
export class ContactCardComponent {

  @Input() contact: any;
  @Input() isActive:boolean = false;

  @Output() onClick:EventEmitter<any> = new EventEmitter<any>();

  getCountryFlagClass(countryCode: string): string {
    return getCountryFlagClass(countryCode);
  }

  onClickHandler(){
    this.onClick.emit(this.contact);
  }
}
