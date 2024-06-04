import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-preview-card',
  templateUrl: './form-preview-card.component.html',
  styleUrl: './form-preview-card.component.scss'
})
export class FormPreviewCardComponent {

  activeTab:number = 1;

  @Input()htmlContent!:string;
  @Input()scriptContent!:string;

}
