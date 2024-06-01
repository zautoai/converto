import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  isLoading:boolean = false;

  @ViewChild('errorModal') errorModal!:AdvancedModalsComponent;
  @ViewChild('accountVerificationModal') accountVerificationModal!:AdvancedModalsComponent;

  errorMessages = {
    email: {
      required: 'Email is required',
      email: 'Invalid email format'
    },
    password: {
      required: 'Password is required'
    }
  };
  loginForm:FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });
  

  constructor(
    public authservice: AuthService,
    private router: Router,
    public restService: RestService,
    private notifService: NotificationService,
    private route: ActivatedRoute,
    private avatarService:AvatarService,
  ) { 
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(querys=>{
      const token = querys.get('token');
      if(token)
      {
        console.log(token);
        this.restService.get(API.main.register + "/verify","")
        .subscribe((response)=>{
          console.log(response);
          this.errorModal.modalTitle = 'Email Account Verified';
          this.errorModal.modalMessage = "Email Account Verified!";
          this.errorModal.open();
        },(error)=>{
          console.log(error);
          this.errorModal.modalTitle = 'Email Account Not Verified';
          this.errorModal.modalMessage = error.error.message;
          this.errorModal.open();
        });

      }
    });
  }

  onLogin() {
    this.isLoading = true;
    if (this.loginForm.valid) {
      this.restService.auth(this.email.value, this.password.value).subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.accessToken);
          this.authservice.setUser(response.user);
          this.notifService.showInfo('Welcome to Converto!');
          if (!response.avatar) {
            this.router.navigate(['/setup']);
          }
          else {
            this.avatarService.setAvatarData(response.avatar);
            if (response.avatar.status == 'ACTIVE') {
              this.router.navigate(['/dashboard']);
            }
            else {
              this.router.navigate(['/setup']);
            }
          }
          this.isLoading = false;
        },
        error: (_error: any) => {
          if (_error.error.message == 'Account not verified') {
            this.errorModal.modalTitle = 'Account not verified';
            this.errorModal.modalMessage = 'Please verify your email account';
            this.accountVerificationModal.open();
          }
          else {
            this.errorModal.modalTitle = 'Login Failed';
            this.errorModal.modalMessage = _error.error.message;
            this.errorModal.open();
          }
          this.isLoading = false;
          this.loginForm.enable();
        }
      });
    }
    else
    {
      markFormGroupAsDirty(this.loginForm);
    }
  }

  onVerifySubmit(event:any)
  {
    this.restService.post(API.main.register + `/resendVerification`, { email: this.email })
    .subscribe((response: any) => {
      console.log(response);

    }, (error) => {
      console.log(error);
    });
  }

  get form() {
    return this.loginForm.controls;
  }
  get email() {
    return this.loginForm.get('email') as FormControl;
  }
  get password() {
    return this.loginForm.get('password') as FormControl;
  }

}
