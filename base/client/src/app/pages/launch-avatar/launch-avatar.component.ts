import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { WebsocketService } from 'src/app/shared/services/websocket.service';
import { Router } from '@angular/router';
import { Avatar, AvatarService } from 'src/app/shared/services/avatar.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { SetupService } from 'src/app/shared/services/setup.service';

@Component({
  selector: 'app-launch-avatar',
  templateUrl: './launch-avatar.component.html',
  styleUrls: ['./launch-avatar.component.scss']
})
export class LaunchAvatarComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  avatar!: Avatar;
  launchForm: FormGroup;
  errorFeedback: any = { avatarName: "", companyName: "", siteUrl: "" };
  trainingProgress = 0;
  isAvatarNameValid: boolean = true;
  isSubmitting:boolean = false;
  avatarNameTimeout: any = null;

  constructor(
    private setupService: SetupService,
    private formBuilde: FormBuilder,
    private restService: RestService,
    private socketService: WebsocketService,
    private router: Router,
    private avatarService: AvatarService,
    private notifiService: NotificationService
  ) {
    this.launchForm = this.formBuilde.group({
      companyName: ['', Validators.required],
      siteUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      avatarName: ['', Validators.required],
    });
    this.avatarService.avatarEvent$.subscribe((data: any) => {
      if (data) {
        this.avatar = data;
        this.avatar.status = this.getTrainingProgress('training_status') || "";
        this.avatar.message = this.getTrainingProgress('training_message') || "";
        this.trainingProgress = Number(this.getTrainingProgress('training_progress')) || 0;
        this.registerStatusEvent(data?.id);
      }
    });
    this.socketService.agentStatusEvent$.subscribe((data: any) => {
      this.avatar.status = data.status;
      this.avatar.message = data.message;
      if(data.status != 'TRAININGFAILED')
      {
        this.trainingProgress += 20;
      }
      this.setTrainingProgress(data?.status, data?.message, this.trainingProgress);
      if (data.status == 'ACTIVE') {
        this.clearTrainingProgress();
        this.router.navigate(['/dashboard']);
        this.setupService.markSetupCompleted();
      }
    });
  }

  ngOnInit(): void {


  }

  registerStatusEvent(agentId: string) {
    this.socketService.offAgentUpdateEvent(agentId);
    this.socketService.listenAgentUpdateEvent(agentId);
  }

  onAvatarCreate() {
    this.resetErrorFeedback();
    const avatarName: string = this.launchForm.value.avatarName || "";
    const companyName: string = this.launchForm.value.companyName || "";
    let websiteUrl: string = this.launchForm.value.siteUrl || "";
    
    if (this.launchForm.valid) {
      try {
        const urlObject = new URL(websiteUrl);
        websiteUrl = urlObject?.origin;
      }
      catch (error) {      
        this.errorFeedback.siteUrl = "Invalid website URL.";
        return;
      }
      const data = {
        displayName: avatarName,
        companyName: companyName,
        companySite: websiteUrl
      };

      this.clearTrainingStatus();
      this.launchForm.disable();
      this.isSubmitting = true;
      this.restService.post(API.main.launchAvatar, data)
        .subscribe((response: any) => {
          this.avatarService.setAvatarData(response);
          this.resetErrorFeedback();
          this.launchForm.reset();
          this.launchForm.enable();
          this.isSubmitting = false;
        }, (error) => {
          this.notifiService.showError(error.error.message);
          console.log(error);
          this.launchForm.enable();
          this.isSubmitting = false;
        });

    }
    else {

      if (avatarName.length <= 0) {
        this.errorFeedback.avatarName = "Avatar name required.";
      }
      if (companyName.length <= 0) {
        this.errorFeedback.companyName = "Company name required.";
      }
      if (websiteUrl.length <= 0) {
        this.errorFeedback.siteUrl = "Website URL required.";
      }
      else {
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
        if (!urlPattern.test(websiteUrl)) {
          this.errorFeedback.siteUrl = "Invalid website URL.";
        }
      }
    }

  }

  checkAvatarName(event: Event) {
    this.resetErrorFeedback();
    const name = this.launchForm.value.avatarName;

    if (!name) {
      return;
    }

    if (this.avatarNameTimeout) {
      clearTimeout(this.avatarNameTimeout);
    }

    this.avatarNameTimeout = setTimeout(() => {
      this.restService.post(API.main.agentAvailability, { name: name })
        .subscribe(
          (response: any) => {
            this.isAvatarNameValid = response?.available;
            if (!this.isAvatarNameValid) {
              this.errorFeedback.avatarName = "Avatar name already taken.";
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }, 1000);

  }

  isFieldValid(fieldName: string): boolean {
    const control = this.launchForm.get(fieldName)!;
    return control.invalid && control.dirty;
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = "";

    }
  }

  getStatusColor(status: string): string {
    const colorList: any = { ACTIVE: "success", INACTIVE: "danger", TRAINING: "primary", TRAININGFAILED: "danger" };
    return colorList[status] || "dark";
  }

  setTrainingProgress(status: string, message: string, progress: number) {
    localStorage.setItem('training_status', status);
    localStorage.setItem('training_message', message);
    localStorage.setItem('training_progress', progress.toString());
  }

  getTrainingProgress(key: string) {
    return localStorage.getItem(key);
  }

  clearTrainingProgress() {
    localStorage.removeItem('training_status');
    localStorage.removeItem('training_message');
    localStorage.removeItem('training_progress');
  }

  deleteAvatar() {
    let id = this.avatarService.getAvatarId();
    if(id) {
      this.restService.delete(API.main.agent, id)
      .subscribe((response: any) => {
        this.router.navigate(['/auth/login']);
        this.clearTrainingStatus();
      }, (error) => {
        console.log(error);
      });
    }
  }

  clearTrainingStatus()
  {
    localStorage.removeItem('training_progress')
    localStorage.removeItem('training_status')
    localStorage.removeItem('training_message')
  }
}
