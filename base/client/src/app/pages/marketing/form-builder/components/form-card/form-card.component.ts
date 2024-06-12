import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getCountryFlagClass } from 'src/app/pages/engagements/contacts/contact.utils';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrl: './form-card.component.scss'
})
export class FormCardComponent {
  @Input() data: any;
  @Input() isActive:boolean = false;

  @Output() onClick:EventEmitter<any> = new EventEmitter<any>();

  getCountryFlagClass(countryCode: string): string {
    return getCountryFlagClass(countryCode);
  }

  onClickHandler(){
    this.onClick.emit(this.data);
  }
}
