import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  private createAlert(icon: any, title: string, text: string, buttons?: string[] , callback?: (result: any) => void): void {
    const swalConfig: any = {
      icon: icon,
      title: title,
      text: text,
      confirmButtonText: 'Ok',
    };
  
    if (buttons && buttons.length > 0) {
      swalConfig.showCancelButton = true;
      swalConfig.confirmButtonText = buttons[0];
      swalConfig.buttons = buttons.slice(1).map(buttonText => buttonText);
    }
  
    Swal.fire(swalConfig).then((result) => {
      if (callback) {
        callback(result);
      }
    });
  }

  showAlert(icon: any, title: string, text: string, buttons?: string[], callback?: (result: any) => void): void {
    this.createAlert(icon, title, text, buttons, callback);
  }

  success(title: string, text: string, buttons?: string[], callback?: (result: any) => void): void {
    this.showAlert('success', title, text, buttons, callback);
  }

  warning(title: string, text: string, buttons?: string[], callback?: (result: any) => void): void {
    this.showAlert('warning', title, text, buttons, callback);
  }

  error(title: string, text: string, buttons?: string[], callback?: (result: any) => void): void {
    this.showAlert('error', title, text, buttons, callback);
  }

  prompt(title: string, text: string, buttons?: string[], callback?: (result: any) => void): void {
    this.showAlert('question', title, text, buttons, callback);
  }

  confirm(title: string, text: string, buttons?: string[], callback?: (result: any) => void): void {
    this.showAlert('warning', title, text, buttons, callback);
  }

  info(title: string, text: string, buttons?: string[], callback?: (result: any) => void): void {
    this.showAlert('info', title, text, buttons, callback);
  }
}
