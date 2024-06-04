import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-abm-card-preview',
  templateUrl: './abm-card-preview.component.html',
  styleUrl: './abm-card-preview.component.scss'
})
export class AbmCardPreviewComponent {
@Input()abm:any
}
