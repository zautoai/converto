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
  isLoading: boolean = false;

  @ViewChild('errorModal') errorModal!: AdvancedModalsComponent;
  @ViewChild('accountVerificationModal') accountVerificationModal!: AdvancedModalsComponent;

  errorMessages = {
    email: {
      required: 'Email is required',
      email: 'Invalid email format'
    },
    password: {
      required: 'Password is required'
    }
  };
  errorMessage:string | null = null;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });


  constructor(
    public authservice: AuthService,
    private router: Router,
    public restService: RestService,
    private notifService: NotificationService,
    private route: ActivatedRoute,
    private avatarService: AvatarService,
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(querys => {
      const authToken = querys.get('authToken');
      if (authToken) {
        localStorage.setItem('token', authToken);
        this.continueLoginTasks();
      }

      const token = querys.get('token');
      if (token) {
        this.restService.get(API.main.register + "/verify", "")
          .subscribe((response) => {
            this.errorModal.modalTitle = 'Email Account Verified';
            this.errorModal.modalMessage = "Email Account Verified!";
            this.errorModal.open();
          }, (error) => {
            this.errorMessage = 'Email Account Not Verified';
          });
      }
    });
  }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = null;
    if (this.loginForm.valid) {
      this.restService.auth(this.email.value, this.password.value).subscribe({
        next: (response: any) => {
          const authToken = response.accessToken;
          const avatar = response.avatar;
          const user = response.user;

          this.authservice.setUser(user);
          this.notifService.showInfo('Welcome to Converto!');
          this.avatarService.setAvatarData(avatar);

          const continueLoginTasks = () => {
            if (!avatar) {
              this.router.navigate(['/setup']);
            } else {
              if (avatar.status === 'ACTIVE') {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/setup']);
              }
            }
            this.isLoading = false;
          };

          // Extract the current domain and port
          const currentDomain = window.location.hostname;
          const currentPort = window.location.port ? `:${window.location.port}` : '';
          const protocol = window.location.protocol;

          const domainParts = currentDomain.split('.');
          if (domainParts.length > 2) {
            domainParts.shift(); // Remove the first part (subdomain)
          }
          const baseDomain = domainParts.join('.');
          const newDomain = `${user.orgId}.${baseDomain}${currentPort}`;
          console.log(`Redirect URL : ${protocol}//${newDomain}/auth/login`);

          if (currentDomain !== newDomain) {
            // Redirect with the token in URL parameters
            
            const url = new URL(`${protocol}//${newDomain}/auth/login`);
            url.searchParams.append('authToken', authToken);

            setTimeout(() => {
              window.location.href = url.toString();
            }, 100);
          } else {
            continueLoginTasks();
          }
        },
        error: (_error: any) => {
          this.isLoading = false;
          this.errorMessage = _error.error.message;
          this.isLoading = false;
        }
      });
    } else {
      markFormGroupAsDirty(this.loginForm);
      this.isLoading = false;
    }
  }

  continueLoginTasks() {
    this.restService.get(API.main.verify, '').subscribe({
      next: (response: any) => {
        const user = response.user;
        const avatar = response.avatar;

        this.authservice.setUser(user);
        this.notifService.showInfo('Welcome to Converto!');
        this.avatarService.setAvatarData(avatar);
        if (avatar.status === 'ACTIVE') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/setup']);
        }
      },
      error: (_error: any) => {
        this.errorMessage = _error.error.message;
        this.router.navigate(['/login']);
      }
    });
    this.isLoading = false;
  }

  onVerifySubmit(event: any) {
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
