import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { togglePassword } from 'src/app/common/utils';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  disabled = ""
  email = "";
  password = "";
  name = "";
  message = '';
  errorMessage = ''; // validation error handle
  isAgreeTerms:boolean = false;
  _error: { name: string, message: string } = { name: '', message: '' };
  isSubmitting:boolean = false;
  togglePassword = togglePassword;


  constructor(public authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    public restService: RestService,
    private notifService: NotificationService,
    private sweetAlert:SweetAlertService) { }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  clearErrorMessage() {
    this.errorMessage = '';
    this.error = { name: '', message: '' };
  }


  validateForm(email: string, password: string) {
    console.log(email, password)
    if (email.length === 0) {
      this.errorMessage = "please enter email id";
      return false;
    }

    if (password.length === 0) {
      this.errorMessage = "please enter password";
      return false;
    }

    if (password.length < 6) {
      this.errorMessage = "password should be at least 6 char";
      return false;
    }

    this.errorMessage = '';
    return true;

  }
  public registrationForm!: FormGroup;
  public error: any = '';

  get form() {
    return this.registrationForm.controls;
  }

  submit() {
    this.email = this.registrationForm.get('email')?.value;
    this.password = this.registrationForm.get('password')?.value;
    this.name = this.getNameFromEmail(this.email);
    this.isSubmitting = true;
    this.registrationForm.disable();
    if (this.validateForm(this.email, this.password)) {
      this.restService.post(API.main.register, { email: this.email, password: this.password,name: this.name })
        .subscribe({
          next: (response: any) => {
            console.log(response)
            this.sweetAlert.success("Welcome to ZautoAI!","Please check and verify your account.");
            this.router.navigate(['']);
          }, error: (error) => {
            console.log(error)
            const _error = error.error;
            this.sweetAlert.error("Error",_error.message);
            this.isSubmitting = false;
            this.registrationForm.enable();
          }
        })
    } else {
      this.error = "Please check email and passowrd";
      this.notifService.showError(this.error);
      this.isSubmitting = false;
      this.registrationForm.enable();
    }
  }

  getNameFromEmail(email:string)
  {
    const name = email.split('@')[0];
    return name;
  }
  public toggleAgreeTerms() {
    this.isAgreeTerms = !this.isAgreeTerms;
  }
}

