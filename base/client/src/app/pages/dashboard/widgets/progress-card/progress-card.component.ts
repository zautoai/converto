import { Component, Input } from '@angular/core';
import { PercentageData } from '../../dashboard.component';

@Component({
  selector: 'app-progress-card',
  templateUrl: './progress-card.component.html',
  styleUrls: ['./progress-card.component.scss']
})
export class ProgressCardComponent {

  @Input() isLoading:boolean = false;
  @Input() title!:string;
  @Input() percentageData: PercentageData = {
    visitorPercentage: 0,
    leadPercentage: 0,
    conversationPercentage: 0,
  };

}
