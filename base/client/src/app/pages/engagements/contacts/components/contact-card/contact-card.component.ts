import { Component, EventEmitter, Input, Output } from '@angular/core';

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

    if (countryCode) {
      const countryCodes: { [key: string]: string } = {
        unitedstates: 'us',
        india: 'in',
        australia: 'au',
        canada: 'ca',
        unitedkingdom: 'gb',
        germany: 'de',
        france: 'fr',
        china: 'cn',
        japan: 'jp',
        southkorea: 'kr',
        brazil: 'br',
        mexico: 'mx',
        southafrica: 'za',
        italy: 'it',
        spain: 'es',
        russia: 'ru',
        netherlands: 'nl',
        sweden: 'se',
        switzerland: 'ch',
        norway: 'no'
      };

      return countryCodes[countryCode.toLowerCase()] || '';
    } else {
      return '';
    }
  }

  onClickHandler(){
    this.onClick.emit(this.contact);
  }
}
