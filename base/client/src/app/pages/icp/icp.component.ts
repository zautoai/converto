import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

@Component({
  selector: 'app-icp',
  templateUrl: './icp.component.html',
  styleUrl: './icp.component.scss'
})
export class IcpComponent {

  @ViewChild('updateUserOffcanvas') updateUserOffcanvas: ElementRef | undefined;


errorFeedback: any = { title: '', describe: '' };
  icpdata: any = []
  user: any = {};
  
  isEdit: boolean = false;

  constructor(
    private restService: RestService,
    private notifService: NotificationService,
    private modalService: NgbModal,
    private sweetAlertService: SweetAlertService,
    private router: Router,
    private offcanvasService: NgbOffcanvas,
  ) {

  }

  ngOnInit(): void {
    this.getIcps();
  }

  getIcps(): void {
    this.restService.getAll(API.main.icp).subscribe({
      next: (response: any) => {
        this.icpdata = response.data;
        console.log("test", this.icpdata)
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  handleCreate(): void {
    this.router.navigate(['/icp/create']);
  }
  
  
  /**resterror */



  delete = (data: any) => {
    this.user = data;

    this.sweetAlertService.warning(
      'Delete user',
      'Are you sure you want to delete ?',
      ['Delete', 'Cancel'],
      (confirm: any) => {
        if (confirm.isConfirmed) {
          this.confirmDelete(data);
        }
      },
    );
  };

  confirmDelete = (data: any) => {
    this.restService.delete(API.main.contact, data.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Accounts Deleted Successfully.');
        this.closeModal();
        console.log(this.user);
        this.getIcps()
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };
  closeModal = () => {
    this.user = {};
    this.isEdit = false;
    this.modalService.dismissAll();
  };

}


