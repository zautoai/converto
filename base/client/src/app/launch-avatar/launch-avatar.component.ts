import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { WebsocketService } from 'src/app/shared/services/websocket.service';
import { Router } from '@angular/router';
import { Avatar, AvatarService } from 'src/app/shared/services/avatar.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { SetupService } from 'src/app/shared/services/setup.service';
import { markFormGroupAsDirty } from '../components/advanced-inputs/input.util';
import { debounceTime } from 'rxjs';

interface Step {
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

@Component({
  selector: 'app-launch-avatar',
  templateUrl: './launch-avatar.component.html',
  styleUrls: ['./launch-avatar.component.scss']
})
export class LaunchAvatarComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  avatar!: Avatar;
  launchForm: FormGroup = new FormGroup({
    companyName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    companySite: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
    displayName: new FormControl('', [Validators.required])
  });
  errorMessages = {
    companyName: {
      required: 'Company name is required',
      minlength: 'Company name must be at least 3 characters long'
    },
    siteUrl: {
      required: 'Site URL is required',
      pattern: 'Site URL must be a valid URL'
    },
    avatarName: {
      required: 'Avatar name is required'
    }
  };

  isLoading: boolean = false;

  trainingProgress = 0;
  isAvatarNameValid: boolean = true;

  steps: Step[] = [
    { status: 'pending', description: 'Step 1: Initialization' },
    { status: 'pending', description: 'Step 2: Processing Data' },
    { status: 'pending', description: 'Step 3: Validating Results' },
    { status: 'pending', description: 'Step 4: Finalizing' }
  ];
  currentStep: number = 0;

  constructor(
    private setupService: SetupService,
    private restService: RestService,
    private socketService: WebsocketService,
    private router: Router,
    private avatarService: AvatarService,
    private notifiService: NotificationService
  ) {
  }

  ngOnInit(): void {
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
      console.log(data);

      this.avatar.status = data.status;
      this.avatar.message = data.message;

      if (data.status != 'TRAININGFAILED') {
        this.trainingProgress += 20;
      }
      this.setTrainingProgress(data?.status, data?.message, this.trainingProgress);
      console.log(this.avatar);
      if (data.status == 'ACTIVE') {
        this.clearTrainingProgress();
        this.router.navigate(['/dashboard']);
        this.setupService.markSetupCompleted();
      }
    });
    this.avatarName.valueChanges.pipe(debounceTime(1000)).subscribe(value => {
      this.checkAvatarName(value);
    });
    // this.startProcess()
  }

  get companyName(): FormControl {
    return this.launchForm.get('companyName') as FormControl;
  }

  get siteUrl(): FormControl {
    return this.launchForm.get('companySite') as FormControl;
  }

  get avatarName(): FormControl {
    return this.launchForm.get('displayName') as FormControl;
  }

  startProcess(): void {
    const interval = setInterval(() => {
      if (this.currentStep < this.steps.length) {
        const isFailed = Math.random() < 0.3;
        this.steps[this.currentStep].status = isFailed ? 'failed' : 'completed';
        this.currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 1000); // Adjust the interval as needed
  }

  registerStatusEvent(agentId: string) {
    this.socketService.offAgentUpdateEvent(agentId);
    this.socketService.listenAgentUpdateEvent(agentId);
  }

  onAvatarCreate() {
    if (this.launchForm.valid) {
      const data = this.launchForm.value;
      this.clearTrainingStatus();
      this.isLoading = true;
      this.restService.post(API.main.launchAvatar, data)
        .subscribe((response: any) => {
          this.avatarService.setAvatarData(response);
          this.registerStatusEvent(response?.id);
          this.avatar = response;
        }, (error) => {
          this.notifiService.showError(error.error.message);
          console.log(error);
          this.isLoading = false;
        });

    }
    else {
      markFormGroupAsDirty(this.launchForm);
    }

  }

  checkAvatarName(name: string) {
    if (!name) {
      return;
    }
    this.restService.post(API.main.agentAvailability, { name: name })
      .subscribe(
        (response: any) => {
          this.isAvatarNameValid = response?.available;
          if (!this.isAvatarNameValid) {
            // this.errorFeedback.avatarName = "Avatar name already taken.";
          }
        },
        (error) => {
          console.log(error);
        }
      );
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
    if (id) {
      this.restService.delete(API.main.agent, id)
        .subscribe((response: any) => {
          this.router.navigate(['/auth/login']);
          this.clearTrainingStatus();
        }, (error) => {
          console.log(error);
        });
    }
  }

  clearTrainingStatus() {
    localStorage.removeItem('training_progress')
    localStorage.removeItem('training_status')
    localStorage.removeItem('training_message')
  }





}
