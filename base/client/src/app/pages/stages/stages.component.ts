import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { AvatarService } from 'src/app/shared/services/avatar.service';

@Component({
  selector: 'app-stages',
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.scss']
})
export class StagesComponent implements OnInit {

  angetId: any = undefined;
  stageList: any = [];
  selectedStage: any = null;

  stageForm: FormGroup;
  errorFeedback: any = { name: "", instruction: "" };

  showAvatarSettings:boolean = false;

  @ViewChild('createStageOffcanvas') createStageModal: ElementRef | any;
  @ViewChild('editStageOffcanvas') editStageModal: ElementRef | any;
  @ViewChild('deleteStageModal') deleteStageModal: ElementRef | any;

  constructor(
    private restService: RestService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notifService: NotificationService,
    private offcanvasService:NgbOffcanvas,
    private avatarService:AvatarService
  ) {
    this.stageForm = this.formBuilder.group({
      name: ['', Validators.required],
      instruction: ['', Validators.required],
    });
    this.avatarService.avatarEvent$.subscribe((data:any)=>{
      this.angetId = data?.id;
    });
  }

  ngOnInit(): void {
    this.angetId = this.avatarService.getAvatarId();
    this.getStages();
  }

  getStages() {
    const endpoint = API.main.stages;
    this.restService.getAll(endpoint)
      .subscribe((response: any) => {
        this.stageList = response;

      }, (error) => {
        console.log(error);
      });
  }

  selectStage(stage: any) {
    this.selectedStage = stage;
    this.showAvatarSettings = false;
  }

  openCreateStage() {
    this.resetErrorFeedback();
    this.stageForm.reset();
    this.offcanvasService.open(this.createStageModal,{
      position:'end',
      backdrop:'static',
      panelClass:'visible',
      animation: true,
    });
  }

  openEditStage() {
    this.resetErrorFeedback();
    this.stageForm.reset();
    this.stageForm.patchValue(this.selectedStage);
    this.offcanvasService.open(this.editStageModal,{
      position:'end',
      backdrop:'static',
      panelClass:'visible',
      animation: true,
    });
  }

  openDeleteStage() {
    this.stageForm.reset();
    this.modalService.open(this.deleteStageModal, { centered: true, size: 'md' });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onCreateStageSubmit() {
    this.resetErrorFeedback();
    const name: string = this.stageForm.value.name || "";
    const instruction: string = this.stageForm.value.instruction || "";

    if (this.stageForm.valid) {
      const sequence = this.getNextSequence();
      const data = {
        name,
        instruction,
        sequence,
      };

      const endpoint = API.main.agentStages.replace(':agentId', this.angetId);
      this.restService.post(endpoint, data)
        .subscribe((response: any) => {
          this.getStages();
          this.offcanvasService.dismiss();
          this.stageForm.reset();
          this.notifService.showSuccess("New stage added.");
        }, (error) => {
          console.log(error);
        });
    }
    else {
      if (name.length <= 0) {
        this.errorFeedback.name = "Name required."
      }
      if (instruction.length <= 0) {
        this.errorFeedback.instruction = "Instruction required."
      }
    }
  }

  onEditStageSubmit() {
    this.resetErrorFeedback();
    const name: string = this.stageForm.value.name || "";
    const instruction: string = this.stageForm.value.instruction || "";

    if (this.stageForm.valid) {
      // const sequence = this.getNextSequence();
      const sequence = this.getNextSequence();
      const data = {
        name,
        instruction,
        // sequence,
      };
      // console.log("DEBUG STAGE:",data);
      
      // return;
      this.restService.patch(API.main.stages, this.selectedStage.id, data)
        .subscribe((response: any) => {
          this.getStages();
          this.offcanvasService.dismiss();
          this.stageForm.reset();
          this.notifService.showSuccess("Stage updated.");
          this.selectedStage = response;
        }, (error) => {
          console.log(error);
        });
    }
    else {
      if (name.length <= 0) {
        this.errorFeedback.name = "Name required."
      }
      if (instruction.length <= 0) {
        this.errorFeedback.instruction = "Instruction required."
      }
    }
  }

  onDeleteStageSubmit() {
    if (this.selectedStage && this.angetId) {
      const endpoint = API.main.stages;
      this.restService.delete(endpoint, this.selectedStage.id)
        .subscribe((response: any) => {
          this.getStages();
          this.closeModal();
          this.selectedStage = null;
          this.notifService.showSuccess("Stage deleted");
        }, (error) => {
          console.log(error);
        });
    }
  }

  stageUp(stage: any) {
    const index = this.stageList.indexOf(stage);
    if (index > 0 && index < this.stageList.length) {
      const temp = this.stageList[index].sequence;
      this.stageList[index].sequence = this.stageList[index - 1].sequence;
      this.stageList[index - 1].sequence = temp;
      this.onUpdateSequence();
    }
  }

  stageDown(stage: any) {
    const index = this.stageList.indexOf(stage);
    if (index >= 0 && index < this.stageList.length - 1) {
      const temp = this.stageList[index].sequence;
      this.stageList[index].sequence = this.stageList[index + 1].sequence;
      this.stageList[index + 1].sequence = temp;
      this.onUpdateSequence();
    }
  }

  onUpdateSequence()
  {
    const data = {stages:this.stageList};
    const endpoint = API.main.agentStages.replace(':agentId',this.angetId);
    this.restService.post(endpoint+'/sequence',data)
    .subscribe((response:any)=>{
      this.getStages();
      this.selectedStage = null;
    },(error)=>{
      console.log(error);
    });
  }

  sortStages()
  {
    const sortedArray = this.stageList.slice().sort((a:any, b:any) => {
      return a.sequence - b.sequence;
    });
    this.stageList = sortedArray;
  }


  isFieldValid(fieldName: string): boolean {
    const control = this.stageForm.get(fieldName)!;
    return control.invalid && control.dirty;
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = "";

    }
  }

  getNextSequence(): number {
    const maxSequence = this.stageList.reduce((max: any, obj: any) => {
      return obj.sequence > max ? obj.sequence : max;
    }, 0);
    const nextSequence = maxSequence + 1;
    return nextSequence;
  }

  toggleAvatarSettings(){
    this.showAvatarSettings = !this.showAvatarSettings;
    this.selectedStage = null;
  }
}
