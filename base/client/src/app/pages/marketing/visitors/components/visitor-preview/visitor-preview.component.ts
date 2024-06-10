import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-visitor-preview',
  templateUrl: './visitor-preview.component.html',
  styleUrl: './visitor-preview.component.scss'
})
export class VisitorPreviewComponent {
  @Input() visitor!: any;

  getTrackingInfo(){
    return JSON.parse(this.visitor.trackingInfo);
  }
}
