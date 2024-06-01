import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
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

  @ViewChild(AdvancedModalsComponent) alertModal!:AdvancedModalsComponent;

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
    private sweetAlert:SweetAlertService,
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
          this.sweetAlert.success("Email Account Verified!","You can now enjoy full access to our platform.")
        },(error)=>{
          console.log(error);
          this.alertModal.modalMessage = error.error.message;
          this.alertModal.open();
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
            this.sweetAlert.warning("Verify email account", `✉ ${this.email}`, ['Resend mail'], (result) => {
              if (result.isConfirmed) {
                console.log('User clicked OK');
                this.restService.post(API.main.register + `/resendVerification`, { email: this.email })
                  .subscribe((response: any) => {
                    console.log(response);

                  }, (error) => {
                    console.log(error);
                  });
              }
            });
          }
          else {
            this.alertModal.modalMessage = _error.error.message;
            this.alertModal.open();
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
