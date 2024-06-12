import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-account-preview',
  templateUrl: './account-preview.component.html',
  styleUrl: './account-preview.component.scss'
})
export class AccountPreviewComponent {

  @Input() account:any
  



}
