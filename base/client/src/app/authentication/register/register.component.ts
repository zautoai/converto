import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { togglePassword } from 'src/app/common/utils';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  isAgreeTerms:boolean = false;
  isLoading:boolean = false;

  errorMessages = {
    name: {
      required: 'Name is required',
      minlength: 'Name must be at least 3 characters'
    },
    email: {
      required: 'Email is required',
      email: 'Invalid email format'
    },
    password: {
      required: 'Password is required',
      minlength: 'Password must be at least 6 characters'
    },
    terms: {
      requiredTrue: 'You must agree to the terms and conditions'
    }
  };

  registrForm:FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    terms: new FormControl(false, [Validators.requiredTrue])
  });

  constructor(public authService: AuthService,
    private router: Router,
    public restService: RestService,
    private notifService: NotificationService,
    private sweetAlert:SweetAlertService) { }

  ngOnInit(): void {
    
  }

  get name(){
    return this.registrForm.get('name') as FormControl;
  }
  get email(){
    return this.registrForm.get('email') as FormControl;
  }
  get password(){
    return this.registrForm.get('password') as FormControl;
  }
  get terms(){
    return this.registrForm.get('terms') as FormControl;
  }

  submit() {
    this.isLoading = true;
    if (this.registrForm.valid) {
      this.restService.post(API.main.register, this.registrForm.value)
        .subscribe({
          next: (response: any) => {
            console.log(response)
            this.sweetAlert.success("Welcome to ZautoAI!","Please check and verify your account.");
            this.router.navigate(['']);
          }, error: (error) => {
            console.log(error)
            const _error = error.error;
            this.sweetAlert.error("Error",_error.message);
            this.isLoading = false;
          }
        })
    } 
    else 
    {
      markFormGroupAsDirty(this.registrForm)
      this.isLoading = false;
    }
  }

  public toggleAgreeTerms() {
    this.isAgreeTerms = !this.isAgreeTerms;
  }
}

