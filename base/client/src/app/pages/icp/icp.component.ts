import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { error } from 'console';
import { response } from 'express';
import { forkJoin } from 'rxjs';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

@Component({
  selector: 'app-icp',
  templateUrl: './icp.component.html',
  styleUrls: ['./icp.component.scss']
})
export class IcpComponent {
  @ViewChild('viewIcpOffcanvas') viewIcpOffcanvas: ElementRef | undefined;

  errorFeedback: any = { title: '', describe: '' };
  icpdata: any = [];
  segmentData: any = [];
  segmentCategoryData: any = [];
  user: any = {};
  selectedData: any = {};

  isEdit: boolean = false;

  constructor(
    private restService: RestService,
    private notifService: NotificationService,
    private modalService: NgbModal,
    private sweetAlertService: SweetAlertService,
    private router: Router,
    private offcanvasService: NgbOffcanvas,
  ) { }

  ngOnInit(): void {
    this.getIcps();
  }



  getIcps(): void {
    this.restService.getAll(API.main.icp).subscribe({
      next: (response: any) => {
        this.icpdata = response.data;
        console.log("icpdata", this.icpdata)
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  handleCreate(): void {
    this.router.navigate(['/icp/create']);
  }

  handleEdit(data: any): void {
    this.router.navigate(['/icp/edit', data.id]);
  }

  handleDelete(data: any): any {
    this.restService.delete(API.main.icp, data.id).subscribe(
      (response: any) => {
        this.getIcps();
        this.notifService.showSuccess("deleted");
      }, (error) => {

      }
    )



  }

  delete = (data: any) => {
    this.user = data;

    this.sweetAlertService.warning(
      'Delete ICP',
      'Are you sure you want to delete?',
      ['Delete', 'Cancel'],
      (confirm: any) => {
        if (confirm.isConfirmed) {
          this.confirmDelete(data);
        }
      },
    );
  };

  confirmDelete = (data: any) => {
    this.restService.delete(API.main.icp, data.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('ICP Deleted Successfully.');
        this.closeModal();
        this.getIcps();
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

  handleView(data: any): any {
    this.selectedData = data;
    console.log(this.selectedData)
    this.offcanvasService.open(this.viewIcpOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

}


