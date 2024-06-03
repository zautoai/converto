import { Component,OnInit } from '@angular/core';
import { FormBuilder,Validators,FormGroup, FormControl } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { API } from 'src/app/config/endpoint.config';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { markFormGroupAsDirty,passwordMatchValidator } from 'src/app/components/advanced-inputs/input.util';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit
{
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  token = "";
  isLoading:boolean = false;
  errorMessages = {
    password: {
      required: 'Password is required',
      minlength: 'Password must be at least 6 characters long'
    },
    confirm_password: {
      required: 'Confirm password is required',
      minlength: 'Confirm password must be at least 6 characters long',
      mismatch: 'Passwords do not match'
    }
  };
  errorMessage:string | null = null;
  
  resetForm:FormGroup = new FormGroup({
    password:new FormControl(null,[Validators.required,Validators.minLength(6)]),
    confirm_password:new FormControl(null,[Validators.required,Validators.minLength(6),]),
  },{ validators: passwordMatchValidator });

  constructor(
    private restService:RestService,
    private notifService:NotificationService,
    private router:Router,
    private route:ActivatedRoute,
  ){
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

  get password(){
    return this.resetForm.get('password') as FormControl;
  }

  get confirm_password(){
    return this.resetForm.get('confirm_password') as FormControl;
  }

  submit()
  {

    if(this.resetForm.valid)
    {
      this.isLoading = true;
      this.resetForm.disable({onlySelf:true});
      this.restService.patch(API.main.password,"change",{token:this.token,password:this.password.value})
      .subscribe((response:any)=>{
        console.log(response);
        this.notifService.showSuccess("Password has changed.");
        this.router.navigate(['/auth/login']);
      },(error)=>{
        this.errorMessage = error.error.message;
        this.isLoading = false;
        this.resetForm.disable({onlySelf:false});
      });
    }
    else
    {
      markFormGroupAsDirty(this.resetForm);

    }
  }
}
