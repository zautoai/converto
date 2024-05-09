import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-counter-card',
  templateUrl: './counter-card.component.html',
  styleUrls: ['./counter-card.component.scss']
})
export class CounterCardComponent {

  @Input() isLoading:boolean = false;
  @Input() counter: number = 0;
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() color: string = '';
  @Input() bgColor: string = '';
}
