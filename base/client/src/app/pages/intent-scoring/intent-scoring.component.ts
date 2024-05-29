import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { API } from 'src/app/config/endpoint.config';
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

  isEditing:boolean = false;
  private selectedEntity:any = null;
  intentScoringList: any = null;

  @ViewChild('createOrEditOffcanvas') createOrEditOffcanvas!: ElementRef;
  IntentType = IntentType;

  form:FormGroup = new FormGroup({
    name: new FormControl('',Validators.required),
    description: new FormControl(''),
    value: new FormControl(0,Validators.required),
    type: new FormControl(this.IntentType.POSITIVE,Validators.required),
  })

  constructor(
    private offcanvasService: NgbOffcanvas,
    private restService: RestService,
    private sweetAlertService:SweetAlertService
  ) { }

  ngOnInit(): void {
    this.getAll();
  }

  getAll()
  {
    this.restService.getAll(API.main.intentScoring).subscribe({
      next: (data) => {
        this.intentScoringList = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  openCreate (){
    this.isEditing = false;
    this.selectedEntity = null;
    this.form.reset();
    this.form.get('value')?.setValue(0);
    this.form.get('type')?.setValue(this.IntentType.POSITIVE);
    this.offcanvasService.open(this.createOrEditOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openEdit(item: any){
    this.isEditing = true;
    this.selectedEntity = item;
    this.form.reset();
    this.form.patchValue(item);
    this.offcanvasService.open(this.createOrEditOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  get intentType(): string[] {
    return Object.values(this.IntentType).filter((value) => isNaN(Number(value)));
  }

  submit(){
    if(this.form.valid){
      if(this.isEditing)
      {
        this.restService.patch(API.main.intentScoring, this.selectedEntity?.id,this.form.value).subscribe({
          next: (data) => {
            this.getAll();
            this.offcanvasService.dismiss();
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
      else
      {
        this.restService.post(API.main.intentScoring,this.form.value).subscribe({
          next: (data) => {
            this.getAll();
            this.offcanvasService.dismiss();
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    }
    else
    {
    }
  }

  delete(data: any) {
    this.selectedEntity = data;

    this.sweetAlertService.warning(
      'Delete Intent score',
      'Are you sure you want to delete ?',
      ['Delete', 'Cancel'],
      (confirm: any) => {
        if (confirm.isConfirmed) {
          this.confirmDelete(data);
        }
      },
    );
  };

  confirmDelete = (data: any) => {
    this.restService.delete(API.main.intentScoring, data.id).subscribe(
      (response: any) => {
        this.closeModal();
        this.getAll()
      },
      (error) => {
        console.error(error);
      },
    );
  };

  closeModal = () => {
    this.selectedEntity = null;
    this.isEditing = false;
  };
}
