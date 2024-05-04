import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) { }
  showSuccess(message: string) {
    this.toastr.success(message, 'Success', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
    });
  }

  showError(message: string) {
    this.toastr.error(message, 'Error', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
    });
  }

  showWarning(message: string) {
    this.toastr.warning(message, 'Warning', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
    });  
  }

  showInfo(message:string){
    this.toastr.show(message,'Info',{
      timeOut: 3000,
      positionClass: 'toast-top-center',
      // toastClass:'customtoast',
    })
  }

  showCallingInfo(message:string){
    this.toastr.info(message,'Info',{
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
    })
  }

}
