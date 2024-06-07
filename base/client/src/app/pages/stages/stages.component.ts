import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';

@Component({
  selector: 'app-stages',
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.scss']
})
export class StagesComponent implements OnInit {

  angetId: any = undefined;
  stageList: any = [];
  selectedStage: any = null;
  isEdit: boolean = false;
  isLoading: boolean = false

  errorFeedback: any = { name: "", instruction: "" };

  showAvatarSettings: boolean = false;
  @ViewChild(AdvanceOffcanvasComponent) contactComposeCanvas!: AdvanceOffcanvasComponent;
  @ViewChild('createStageOffcanvas') createStageModal: ElementRef | any;
  @ViewChild('editStageOffcanvas') editStageModal: ElementRef | any;
  @ViewChild('deleteStageModal') deleteStageModal: ElementRef | any;

  constructor(
    private restService: RestService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notifService: NotificationService,
    private offcanvasService: NgbOffcanvas,
    private avatarService: AvatarService
  ) {

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

    this.contactComposeCanvas.open();
  }
  openEditStage(stage: any) {
    this.selectedStage = stage;
    this.form.reset();
    this.form.patchValue(stage)
    this.isEdit = true;
    this.contactComposeCanvas.open();
  }



  openDeleteStage() {

    this.modalService.open(this.deleteStageModal, { centered: true, size: 'md' });
  }

  closeModal() {
    this.modalService.dismissAll();
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

  onUpdateSequence() {
    const data = { stages: this.stageList };
    const endpoint = API.main.agentStages.replace(':agentId', this.angetId);
    this.restService.post(endpoint + '/sequence', data)
      .subscribe((response: any) => {
        this.getStages();
        this.selectedStage = null;
      }, (error) => {
        console.log(error);
      });
  }

  sortStages() {
    const sortedArray = this.stageList.slice().sort((a: any, b: any) => {
      return a.sequence - b.sequence;
    });
    this.stageList = sortedArray;
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

  toggleAvatarSettings() {
    this.showAvatarSettings = !this.showAvatarSettings;
    this.selectedStage = null;
  }



  form: FormGroup = new FormGroup({
    name: new FormControl(''),
    instruction: new FormControl(''),
  })

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }
  get instruction(): FormControl {
    return this.form.get('instruction') as FormControl;
  }
  onCancel() {
    this.contactComposeCanvas.close();
  }
  onSubmit() {
    if (this.form.valid) {
      const formData: { [key: string]: string | null } = this.form.value;
      const data = Object.entries(formData)
        .filter(([_, value]) => value !== null)
        .reduce((acc, [key, value]) => {
          if (value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {} as { [key: string]: string });

      this.isLoading = true;
      if (this.isEdit) {
        this.restService.patch(API.main.agent, this.angetId, this.form.value)
          .subscribe(
            (response: any) => {
              this.notifService.showSuccess('Account Updated Successfully.');
              this.getStages();
              this.isLoading = false;
              this.contactComposeCanvas.close();
            },
            (error) => {
              if (error.status == 500) {
                this.notifService.showError('Something Went Wrong! Try Again Later');
              }
              else {
                this.notifService.showError(error.error.message);
              }
              this.isLoading = false;
            },
          );
      }
      else {
        const endpoint = API.main.agentStages.replace(':agentId', this.angetId);
        this.restService.post(endpoint, data).subscribe({
          next: (response: any) => {
            this.notifService.showSuccess('Stages Added Successfully.');
            this.getStages();
            this.changeDetectorRef.detectChanges();
            this.isLoading = false;
            this.contactComposeCanvas.close();
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status == 500) {
              this.notifService.showError('Something Went Wrong! Try Again Later');
            }
            else {
              this.notifService.showError(error.error.message);
            }
          },
        });
      }
    }
    else {
      markFormGroupAsDirty(this.form);
    }
  }


}
