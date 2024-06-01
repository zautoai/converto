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
  @Input() deleteModalTitle: string = '';
  @Input() deleteModalMessage: string = '';
  @Input() deleteModalConformMessage: string = '';
  @Input() deleteModalCancelMessage: string = '';

  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  @ViewChild('deleteModal') deleteModal?: ElementRef
  @ViewChild('errorModal') errorModal?: ElementRef


  constructor(private readonly modalService: NgbModal) {

  }

  open(entity?: any) {
    this.entity = entity;
    this.isLoading = false;
    this.modalService.open(this.deleteModal, {
      centered: true,
      backdrop: 'static',
      backdropClass: 'blur-backdrop' // Apply blur to the backdrop
    });
  }
  onConfirm() {
    this.isLoading = true;
    this.confirm.emit(this.entity);
  }

  onCancel() {
    this.cancel.emit();
    this.modalService.dismissAll()
  }

}
