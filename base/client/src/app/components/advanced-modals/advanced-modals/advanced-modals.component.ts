import { Component, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-advanced-modals',
  templateUrl: './advanced-modals.component.html',
  styleUrls: ['./advanced-modals.component.scss'] // Changed 'styleUrl' to 'styleUrls'
})
export class AdvancedModalsComponent {

  entity: any | null = null;
  isLoading: boolean = false
  @Input() modalTitle: string = '';
  @Input() modalMessage: string = '';
  @Input() modalConformMessage: string = '';
  @Input() modalCancelMessage: string = '';

  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  @ViewChild('deleteModal') deleteModal?: ElementRef


  constructor(private readonly modalService: NgbModal) {

  }

  open(entity?: any) {
    this.entity = entity;
    this.modalService.open(this.deleteModal, {
      centered: true,
      backdrop: 'static',
      backdropClass: 'blur-backdrop' // Apply blur to the backdrop
    });
  }
  onConfirm() {
    this.confirm.emit(this.entity);
  }

  onCancel() {
    this.cancel.emit();
    this.modalService.dismissAll()
  }

}
