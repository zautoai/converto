import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-visitor-card',
  templateUrl: './visitor-card.component.html',
  styleUrl: './visitor-card.component.scss'
})
export class VisitorCardComponent {

  @Input() data: any;
  @Input() isActive:boolean = false;

  @Output() onClick:EventEmitter<any> = new EventEmitter<any>();


  getTrackingInfo(){
    return JSON.parse(this.data.trackingInfo);
  }

  onClickHandler(){
    this.onClick.emit(this.data);
  }
}
