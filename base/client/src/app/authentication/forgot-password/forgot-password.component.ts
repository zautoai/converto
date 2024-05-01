import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidator } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { API } from 'src/app/config/endpoint.config';
import { Router } from '@angular/router';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit
{
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  email: string = '';
  resetForm:FormGroup;

  isSubmitting:boolean = false;

  constructor(
    public restService: RestService,
    private formBuilder: FormBuilder,
    private notifService: NotificationService,
    private router: Router,
  ){
    this.resetForm = this.formBuilder.group({
      email:['',[Validators.required, Validators.email]],
    });

  }

  ngOnInit(): void 
  {
  }

  submit()
  {
    this.email = this.resetForm.value.email;    
    if(this.resetForm.valid)
    {
      this.isSubmitting = true;
      this.resetForm.disable({onlySelf:true});
      this.restService.post(API.main.password+"/forgot",{email:this.email})
      .subscribe((response:any)=>{
        console.log(response);
        if(response.success)
        {
          this.notifService.showSuccess("Reset password link sent to your mail.");
          this.isSubmitting = false;
          this.resetForm.reset();
          this.resetForm.disable({onlySelf:false});
        }
      },(error)=>{
        console.log(error);
        this.isSubmitting = false;
        this.resetForm.reset();
        this.resetForm.disable({onlySelf:false});
      });
    }
    else
    {
      if(this.email.length === 0)
      {
        this.notifService.showError("Enter registered email account.");
      }
      else if(!this.email.includes('@'))
      {
        this.notifService.showError("Enter valid email.");
      }
    }
  }
}
