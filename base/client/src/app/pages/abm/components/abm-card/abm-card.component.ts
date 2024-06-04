import { Component, EventEmitter, Input, Output,  } from '@angular/core';

@Component({
  selector: 'app-abm-card',
  templateUrl: './abm-card.component.html',
  styleUrl: './abm-card.component.scss'
})
export class AbmCardComponent {
@Input() abm:any
@Input() isActive:boolean = false;

@Output() onClick:EventEmitter<any> = new EventEmitter<any>();


onClickHandler(){
  this.onClick.emit(this.abm);
}
}
