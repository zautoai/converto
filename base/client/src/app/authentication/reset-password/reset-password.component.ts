import { Component,OnInit } from '@angular/core';
import { FormBuilder,Validators,FormGroup } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { API } from 'src/app/config/endpoint.config';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit
{
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  password = "";
  confirm_password = "";
  token = "";
  resetForm:FormGroup;
  isSubmitting:boolean = false;

  constructor(
    private restService:RestService,
    private formBuilder:FormBuilder,
    private notifService:NotificationService,
    private router:Router,
    private route:ActivatedRoute,
  ){
    this.resetForm = this.formBuilder.group({
      password: ['',Validators.required],
      confirm_password: ['',Validators.required],
    })
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((querys)=>{
      const token = querys.get('token');
      if(token)
      {
        this.token = token;
      }
    });
  }

  submit()
  {
    this.password = this.resetForm.value.password;
    this.confirm_password = this.resetForm.value.confirm_password;

    if(this.resetForm.valid)
    {
      if(this.password === this.confirm_password)
      {
        this.isSubmitting = true;
        this.resetForm.disable({onlySelf:true});
        this.restService.patch(API.main.password,"change",{token:this.token,password:this.password})
        .subscribe((response:any)=>{
          console.log(response);
          this.notifService.showSuccess("Password has changed.");
          this.router.navigate(['/auth/login']);
        },(error)=>{
          console.log(error);
          this.notifService.showError(error.error.message);
          this.isSubmitting = false;
          this.resetForm.disable({onlySelf:false});
        });
      }
      else
      {
        this.notifService.showError("Confirm password not matching.");
        this.isSubmitting = false;
        this.resetForm.disable({onlySelf:false});
      }
    }
    else
    {
      if(this.password.length === 0)
      {
        this.notifService.showError("Enter new password.");
      }
      else if(this.confirm_password.length === 0)
      {
        this.notifService.showError("Enter confirm password.");
      }
    }
  }
}
