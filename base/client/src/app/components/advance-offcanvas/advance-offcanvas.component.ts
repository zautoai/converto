import { Component, ElementRef, Input, ViewChild, input } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-advance-offcanvas',
  templateUrl: './advance-offcanvas.component.html',
  styleUrl: './advance-offcanvas.component.scss'
})
export class AdvanceOffcanvasComponent {

  @Input() heading :string = 'Offcanvas Title'
  @Input() size:'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md'
  @ViewChild('offcanvas') offcanvas?: ElementRef ;

  constructor(    
    private offcanvasService: NgbOffcanvas,
  ){}

  open(){
    this.offcanvasService.open(this.offcanvas,{
      position: 'end',
      panelClass: `visible offcanvas-${this.size}`,
      animation: true,
    });
  }

  close(){
    this.offcanvasService.dismiss();
  }
}
