import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrl: './account-card.component.scss'
})
export class AccountCardComponent {
  @Input() account: any;
  @Input() isActive:boolean = false;

  @Output() onClick:EventEmitter<any> = new EventEmitter<any>();



  onClickHandler(){
    this.onClick.emit(this.account);
  }
}
