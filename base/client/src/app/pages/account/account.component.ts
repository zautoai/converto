import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { API } from '../../config/endpoint.config';
import { AvatarService } from '../../shared/services/avatar.service';
import { NotificationService } from '../../shared/services/notification.service';
import { RestService } from '../../shared/services/rest.service';
import { SweetAlertService } from '../../shared/services/sweet-alart.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { response } from 'express';
import { error } from 'console';
@Component({
  selector: 'app-accounts',
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountsComponent implements OnInit {
isHovered: any;
  

  @ViewChild('createUserOffcanvas') createUserOffcanvas: ElementRef | undefined;
  @ViewChild('updateUserOffcanvas') updateUserOffcanvas: ElementRef | undefined;
  @ViewChild('viewUserOffcanvas') viewUserOffcanvas: ElementRef | undefined;
  @ViewChild('deleteModal') deleteModal: ElementRef | undefined;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  user: any = {};
  userList: any = [];
  selectedUser: any = undefined;
  isEdit: boolean = false;
  Form: FormGroup;
  errorFeedback: any = { title: '', describe: '' };
  currentPage: number = 0;
  limit: number = 2;
  submittedData: any[] = [];
  selectedData: any = null;
  totalItems: number = 0;
  accountcontact: Object="";
  hoveredData: any=null;
statusOptions:string[]=['New','Contacted','Interested','Unqualified']
  data = this.hoveredData


  constructor(
    private avatarService: AvatarService,
    private modalService: NgbModal,
    private notifService: NotificationService,
    private restService: RestService,
    private offcanvasService: NgbOffcanvas,
    private formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
    
  ) {
    this.Form = new FormGroup({
      photoUrl: new FormControl(""),
      accountName: new FormControl(""),
      industry: new FormControl(""),
      companySize: new FormControl(""),
      annualRevenue:new FormControl(""),
      accountType: new FormControl(""),
      website: new FormControl(""),
      address: new FormControl(""),
      city: new FormControl(""),
      state: new FormControl(""),
      zip: new FormControl(""),
      country: new FormControl(""),
      phone: new FormControl(""),
      email: new FormControl(""),
      socialMedia: new FormControl(""),
      notes: new FormControl(""),
      source: new FormControl(""),
      status: new FormControl(""),
      isabm:new FormControl(false),
      
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || this.limit;
      this.getAccounts();
      this.getaccountcontacts()
      this.onPageChange({ page: this.currentPage })
    });
  }

  getAccounts(): void {
    this.restService
      .get(API.main.account, `?limit=${this.limit}&page=${this.currentPage}`)
      .subscribe(
        (response: any) => {
          this.submittedData = response.data;
          this.totalItems = response.total
          console.log("accountdata",this.submittedData)
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
  }

  openCreateUser() {
    this.Form.reset();
    this.resetErrorFeedback();
    this.offcanvasService.open(this.createUserOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }
  openViewUser(data: any) {
    this.selectedData = data;
    this.Form.reset();
    this.resetErrorFeedback();
    console.log("datas",data.id)
    this.router.navigate(['accounts/view-account', data.id]);

      
    // this.offcanvasService.open(this.viewUserOffcanvas, {
    //   position: 'end',
    //   backdrop: 'static',
    //   panelClass: 'visible',
    //   animation: true,
    // });
  }

  onCreateuserSubmit() {
    this.resetErrorFeedback();
    const formData: { [key: string]: string | null } = this.Form.value;

    const data = Object.entries(formData)
      .filter(([_, value]) => value !== null)
      .reduce((acc, [key, value]) => {
        if (value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as { [key: string]: string });


      


    this.restService.post(API.main.account, data).subscribe({
      next: (response: any) => {

        this.offcanvasService.dismiss();
        this.notifService.showSuccess('Accounts Added Successfully.');
        this.getAccounts();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    });
  }

  openUpdateUser(data: any) {
    this.user = data; // Store the selected user data
    this.Form.reset();
    console.log("data",data)
    this.Form.patchValue(data);

    this.resetErrorFeedback();
    this.offcanvasService.open(this.updateUserOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  onUpdateuserSubmit(): void {
    const updateAccountFields: any[] = [];
    if (this.Form.get('accountName')?.value) {
      updateAccountFields.push({
        label: 'Account Name',
        value: this.Form.value.accountName,
      });
    }
    if (this.Form.get('industry')?.value) {
      updateAccountFields.push({
        label: 'Industry',
        value: this.Form.value.industry,
      });
    }
    if (this.Form.get('companySize')?.value) {
      updateAccountFields.push({
        label: 'Company Size',
        value: this.Form.value.companySize,
      });
    }
    if (this.Form.get('annualRevenue')?.value) {
      updateAccountFields.push({
        label: 'Annual Revenue',
        value: this.Form.value.annualRevenue,
      });
    }
    if (this.Form.get('accountType')?.value) {
      updateAccountFields.push({
        label: 'AccountType',
        value: this.Form.value.accountType,
      });
    }
    if (this.Form.get('website')?.value) {
      updateAccountFields.push({
        label: 'Website',
        value: this.Form.value.website,
      });
    }
    if (this.Form.get('address')?.value) {
      updateAccountFields.push({
        label: 'Address',
        value: this.Form.value.address,
      });
    }
    if (this.Form.get('city')?.value) {
      updateAccountFields.push({
        label: 'City',
        value: this.Form.value.city,
      });
    }
    if (this.Form.get('state')?.value) {
      updateAccountFields.push({
        label: 'state',
        value: this.Form.value.state,
      });
    }
    if (this.Form.get('zip')?.value) {
      updateAccountFields.push({
        label: 'Zip',
        value: this.Form.value.zip,
      });
    }
    if (this.Form.get('country')?.value) {
      updateAccountFields.push({
        label: 'Country',
        value: this.Form.value.country,
      });
    }
    if (this.Form.get('phone')?.value) {
      updateAccountFields.push({
        label: 'Phone',
        value: this.Form.value.phone,
      });
    }

    if (this.Form.get('socialMedia')?.value) {
      updateAccountFields.push({
        label: 'SocialMedia',
        value: this.Form.value.socialMedia,
      });
    }
    if (this.Form.get('notes')?.value) {
      updateAccountFields.push({
        label: 'Notes',
        value: this.Form.value.notes,
      });
    }
    if (this.Form.get('source')?.value) {
      updateAccountFields.push({
        label: 'Source',
        value: this.Form.value.source,
      });
    }
    if (this.Form.get('abm')?.value) {
      updateAccountFields.push({
        label: 'abm',
        value: this.Form.value.abm,
      });
    }
    if (this.Form.get('status')?.value) {
      updateAccountFields.push({
        label: 'Status',
        value: this.Form.value.status,
      });
    }
    if (this.Form.valid) {
      
      this.restService
        .patch(API.main.account, this.user.id, this.Form.value)
        .subscribe(
          (response: any) => {
            this.notifService.showSuccess('Account Updated Successfully.');
            this.getAccounts();
          },
          (error) => {
            console.error(error);
            this.notifService.showError(
              'Something Went Wrong! Try Again Later',
            );
          },
        );
      this.offcanvasService.dismiss();
      this.Form.reset();
      
    } else {
      this.Form.markAllAsTouched();
    }
  }


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

  closeModal = () => {
    this.user = {};
    this.isEdit = false;
    this.modalService.dismissAll();
  };

  confirmDelete = (data: any) => {
    this.restService.delete(API.main.account, data.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Accounts Deleted Successfully.');
        this.closeModal();
        this.getAccounts()
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getAccounts();
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = '';
    }
  }
  preventDefault(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }
getaccountcontacts(){
this.restService.getAll(API.main.contact).subscribe(
  (response)=>{
    this.accountcontact=response
    console.log("getaccountcontacts",this.accountcontact)
  },
  (error)=>{
console.log(error)
  }
)
}
onMouseEnter(data: any) {
  if(data){
  this.hoveredData=data;
  console.log("hovereddata",this.hoveredData)
  }
  }

/* modal */
openModal(data:any ) {
  if (this.hoveredData) {
    const modalRef = this.modalService.open(this.modalContent, {
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body'
    });

    modalRef.componentInstance.hoveredData = this.hoveredData;

  } 
}}

