import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { toNegative } from 'src/app/common/utils';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

export enum IntentType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE'
}

@Component({
  selector: 'app-intent-scoring',
  templateUrl: './intent-scoring.component.html',
  styleUrl: './intent-scoring.component.scss'
})
export class IntentScoringComponent implements OnInit{

  isEdit:boolean = false;
  private selectedEntity:any = null;
  intentScoringList: any = null;
  currentPage: number = 0;
  limit: number = 10;
  totalItems: number = 0;
  isLoading:boolean = false;

  @ViewChild(AdvanceOffcanvasComponent) advanceOffcanvasComponent!: AdvanceOffcanvasComponent;
  @ViewChild(AdvancedModalsComponent) deleteModal!: AdvancedModalsComponent;
  IntentType = IntentType;

  form:FormGroup = new FormGroup({
    name: new FormControl('',Validators.required),
    description: new FormControl(''),
    value: new FormControl(0,[Validators.required,Validators.min(-100),Validators.max(100)]),
    type: new FormControl(this.IntentType.POSITIVE,[Validators.required]),
  });

  errorMessages = {
    name: {
      required: 'Name is required',
    },
    score: {
      required: 'Value is required',
      min: 'Value must be greater than -100',
      max: 'Value must be less than 100',
    },
    type: {
      required: 'Type is required',
    }
  };

  constructor(
    private restService: RestService,
    private notifService: NotificationService
  ) { }

  get name():FormControl {
    return this.form.get('name') as FormControl;
  }

  get description():FormControl {
    return this.form.get('description') as FormControl;
  }

  get score():FormControl {
    return this.form.get('value') as FormControl;
  }

  get type():FormControl {
    return this.form.get('type') as FormControl;
  }

  ngOnInit(): void {
    this.getAll();
  }

  getAll()
  {
    this.restService.getAll(API.main.intentScoring + `?limit=${this.limit}&page=${this.currentPage}`).subscribe({
      next: (data:any) => {
        this.intentScoringList = data;
        this.totalItems = data.total || 0;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  openCreate (){
    this.isEdit = false;
    this.selectedEntity = null;
    this.form.reset();
    this.form.get('value')?.setValue(0);
    this.form.get('type')?.setValue(this.IntentType.POSITIVE);
    this.advanceOffcanvasComponent.open();
  }

  openEdit(item: any){
    this.isEdit = true;
    this.selectedEntity = item;
    this.form.reset();
    this.form.patchValue(item);
    this.advanceOffcanvasComponent.open();
  }

  openDelete(entity:any){
    this.deleteModal.open(entity);
  }

  closeCanvas(){
    this.advanceOffcanvasComponent.close();
  }

  get intentType(): string[] {
    return Object.values(this.IntentType).filter((value) => isNaN(Number(value)));
  }

  submit(){
    if(this.form.valid){
      this.isLoading = true;
      if(this.isEdit)
      {
        const data = this.form.value;
        if(this.form.get('type')?.value === IntentType.NEGATIVE)
        {
          data.value = toNegative(this.form.get('value')?.value);
        }
        this.restService.patch(API.main.intentScoring, this.selectedEntity?.id,data).subscribe({
          next: (data) => {
            this.getAll();
            this.closeCanvas();
            this.isLoading = false;
            this.notifService.showSuccess('Intent score updated successfully');
          },
          error: (error) => {
            this.isLoading = false;
            if(error.status == 500)
              {
                this.notifService.showError('Something Went Wrong! Try Again Later');
              }
              else{
                this.notifService.showError(error.error.message);
              }
          }
        });
      }
      else
      {
        this.restService.post(API.main.intentScoring,this.form.value).subscribe({
          next: (data) => {
            this.getAll();
            this.closeCanvas();
            this.isLoading = false;
            this.notifService.showSuccess('Intent score created successfully');
          },
          error: (error) => {
            this.isLoading = false;
            if(error.status == 500)
              {
                this.notifService.showError('Something Went Wrong! Try Again Later');
              }
              else{
                this.notifService.showError(error.error.message);
              }
          }
        });
      }
    }
    else
    {
      markFormGroupAsDirty(this.form);
      this.isLoading = false;
    }
  }

  onDeleteSubmit(data: any){
    this.restService.delete(API.main.intentScoring, data.id).subscribe(
      (response: any) => {
        this.getAll();
        this.notifService.showSuccess('Intent score deleted successfully');
      },
      (error) => {
        console.error(error);
      },
    );
  };

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getAll();
  }

  toNegative(value:number)
  {
    if(this.form.get('type')?.value === IntentType.NEGATIVE)
    {
      return toNegative(this.form.get('value')?.value);
    }
    return value;
  }
}
