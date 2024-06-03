import { Component,OnInit } from '@angular/core';
import { FormGroup, Validators, AsyncValidator, FormControl } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { API } from 'src/app/config/endpoint.config';
import { Router } from '@angular/router';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit
{
  GLOBAL_IMAGES = GLOBAL_IMAGES;

  isLoading:boolean = false;

  errorMessages = {
    email: {
      required: 'Email is required',
      email: 'Invalid email format'
    }
  }
  errorMessage:string | null = null;

  resetForm:FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });
  constructor(
    public restService: RestService,
    private notifService: NotificationService,
    private router: Router,
  ){

  }

  get email(){
    return this.resetForm.get('email') as FormControl;
  }

  ngOnInit(): void 
  {
  }

  submit()
  {
    if(this.resetForm.valid)
    {
      this.isLoading = true;
      this.restService.post(API.main.password+"/forgot",this.resetForm.value)
      .subscribe((response:any)=>{
        if(response.success)
        {
          this.notifService.showSuccess("Reset password link sent to your mail.");
          this.isLoading = false;
          this.resetForm.reset();
        }
      },(error)=>{
        this.isLoading = false;
        this.resetForm.reset();
      });
    }
    else
    {
      markFormGroupAsDirty(this.resetForm);
    }
  }
}
