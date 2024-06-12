import { Component, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalTypes } from '../types';

@Component({
  selector: 'app-advanced-modals',
  templateUrl: './advanced-modals.component.html',
  styleUrls: ['./advanced-modals.component.scss'] // Changed 'styleUrl' to 'styleUrls'
})
export class AdvancedModalsComponent {

  entity: any | null = null;
  isLoading: boolean = false
  @Input() modalSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() modalType: ModalTypes = 'delete'
  @Input() modalTitle: string = '';
  @Input() modalMessage: string = '';
  @Input() modalConformMessage: string = '';
  @Input() modalCancelMessage: string = '';

  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  @ViewChild('contentModal') contentModal?: ElementRef


  constructor(private readonly modalService: NgbModal) {

  }

  open(entity?: any) {
    this.entity = entity;
    this.isLoading = false;
    this.modalService.open(this.contentModal, {
      centered: true,
      backdrop: 'static',
      size: this.modalSize,
      backdropClass: 'blur-backdrop' // Apply blur to the backdrop
    });
  }
  onConfirm() {
    this.isLoading = true;
    this.confirm.emit(this.entity);
    this.modalService.dismissAll();
    this.isLoading = false;
  }

  onCancel() {
    this.cancel.emit();
    this.modalService.dismissAll()
  }

}
