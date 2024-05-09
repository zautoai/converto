import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { togglePassword} from 'src/app/common/utils'

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  errorMessage = '';
  _error: any;
  email: string = '';
  password: string = '';
  togglePassword = togglePassword;

  isSubmitting:boolean = false;

  constructor(
    public authservice: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    public restService: RestService,
    private notifService: NotificationService,
    private route: ActivatedRoute,
    private sweetAlert:SweetAlertService,
    private avatarService:AvatarService,
  ) { 
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

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
          this.sweetAlert.error("Error",error.error.message);
        });

      }
    });
  }

  clearErrorMessage() {
    this.errorMessage = '';
    this._error = { name: '', message: '' };
  }

  login() {
    this.clearErrorMessage();
    this.isSubmitting = true;
    this.loginForm.disable();
    if (this.validateForm(this.email, this.password)) {
      this.restService
        .auth(this.email, this.password)
        .subscribe({next: (response: any) => {
          localStorage.setItem('token', response.accessToken);
          this.authservice.setUser(response.user);
          this.notifService.showInfo('Welcome to Converto!');
          if(!response.avatar)
          {
            this.router.navigate(['/setup']);
          }
          else
          {            
            this.avatarService.setAvatarData(response.avatar);
            if(response.avatar.status == 'ACTIVE')
            {
              this.router.navigate(['/dashboard']);
            }
            else
            {
              this.router.navigate(['/setup']);
            }
          }
          this.isSubmitting = false;
          this.loginForm.enable();
        }, error: (_error: any) => {
          this._error = _error;
          if(_error.error.message == 'Account not verified')
          {
            this.sweetAlert.warning("Verify email account",`✉ ${this.email}`,['Resend mail'],(result)=>{
              if (result.isConfirmed) {
                console.log('User clicked OK');
                this.restService.post(API.main.register+`/resendVerification`,{email:this.email})
                .subscribe((response:any)=>{
                  console.log(response);
                  
                },(error)=>{
                  console.log(error);
                });
              }
            });
          }
          else
          {
            this.sweetAlert.error("Error",_error.error.message);
          }
          this.password = '';
          this.isSubmitting = false;
          this.loginForm.enable();
        }});
    }
  }

  validateForm(email: string, password: string) {
    if (email.length === 0) {
      this.errorMessage = 'please enter email id';
      return false;
    }

    if (password.length === 0) {
      this.errorMessage = 'please enter password';
      return false;
    }

    if (password.length < 6) {
      this.errorMessage = 'password should be at least 6 char';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  //angular
  public loginForm!: FormGroup;
  public error: any = '';

  get form() {
    return this.loginForm.controls;
  }

  Submit() {
    this.clearErrorMessage();
    this.email = this.loginForm.get('username')?.value
    this.password = this.loginForm.get('password')?.value

    this.login();
  }

}
