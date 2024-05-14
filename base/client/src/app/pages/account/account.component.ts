import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { API } from '../../config/endpoint.config';
import { AvatarService } from '../../shared/services/avatar.service';
import { NotificationService } from '../../shared/services/notification.service';
import { RestService } from '../../shared/services/rest.service';
import { SweetAlertService } from '../../shared/services/sweet-alart.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-accounts',
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountsComponent implements OnInit {
  @ViewChild('createUserOffcanvas') createUserOffcanvas: ElementRef | undefined;
  @ViewChild('updateUserOffcanvas') updateUserOffcanvas: ElementRef | undefined;
  @ViewChild('viewUserOffcanvas') viewUserOffcanvas: ElementRef | undefined;
  @ViewChild('deleteModal') deleteModal: ElementRef | undefined;

  user: any = {};
  userList: any = [];
  selectedUser: any = undefined;
  isEdit: boolean = false;
  Form: FormGroup;
  errorFeedback: any = { title: '', describe: '' };
  currentPage: number = 0;
  limit: number = 1;
  submittedData: any[] = [];
  selectedData: any = null;
  totalItems: number = 0;

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
  ) {
    this.Form = this.formBuilder.group({
      parentAccountId: [''],
      photoUrl: [''],
      accountName: [''],
      industry: [''],
      companySize: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      annualRevenue: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      accountType: [''],
      website: [''],
      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      country: [''],
      phone: [''],
      email: [''],
      socialMedia: [''],
      notes: [''],
      source: [''],
      status: [''],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || this.limit;
      this.getAccounts();
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
    this.offcanvasService.open(this.viewUserOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
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

    this.Form.get('parentAccountId')?.setValue(data?.parentAccountId);
    this.Form.get('accountName')?.setValue(data?.accountName);
    this.Form.get('industry')?.setValue(data?.industry);
    this.Form.get('companySize')?.setValue(data?.companySize);
    this.Form.get('annualRevenue')?.setValue(data?.annualRevenue);
    this.Form.get('accountType')?.setValue(data?.accountType);
    this.Form.get('website')?.setValue(data?.website);
    this.Form.get('address')?.setValue(data?.address);
    this.Form.get('city')?.setValue(data?.city);
    this.Form.get('state')?.setValue(data?.state);
    this.Form.get('zip')?.setValue(data?.zip);
    this.Form.get('country')?.setValue(data?.country);
    this.Form.get('phone')?.setValue(data?.phone);
    this.Form.get('email')?.setValue(data?.email);
    this.Form.get('socialMedia')?.setValue(data?.socialMedia);
    this.Form.get('notes')?.setValue(data?.notes);
    this.Form.get('source')?.setValue(data?.source);
    this.Form.get('status')?.setValue(data?.status);


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
    if (this.Form.get('status')?.value) {
      updateAccountFields.push({
        label: 'Status',
        value: this.Form.value.status,
      });
    }
    if (this.Form.valid) {
      const updatedAccountData = {
        accountName: this.Form.value.accountName,
        email: this.Form.value.email,
        phone: this.Form.value.phone,
        updateAccountFields,
      };
      this.restService
        .patch(API.main.account, this.user.id, updatedAccountData)
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
}