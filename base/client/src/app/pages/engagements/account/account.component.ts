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
import { API } from '../../../config/endpoint.config';
import { AvatarService } from '../../../shared/services/avatar.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { RestService } from '../../../shared/services/rest.service';
import { SweetAlertService } from '../../../shared/services/sweet-alart.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { response } from 'express';
import { error } from 'console';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';
import { AccountPreviewComponent } from './components/account-preview/account-preview.component';
import { AccountCardComponent } from './components/account-card/account-card.component';
@Component({
  selector: 'app-accounts',
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountsComponent implements OnInit {

  @ViewChild(AdvanceOffcanvasComponent) contactComposeCanvas!: AdvanceOffcanvasComponent;
  @ViewChild('viewContactOffcanvas') viewContactOffcanvas: ElementRef | undefined;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  isLoading: boolean = false;
  selectedaccounts: any;
  isEdit: boolean = false;
  showDescription: boolean = true;
  currentPage: number = 1;
  totalPages: number = 1;
  hoveredData: any = null;
  itemPerPage: number = 10;
  selectedData: any = '';
  limit = 5;
  totalItems: number = 0;
  accountList: any = [];

  errorMessages = {
    // firstName: {
    //   required: 'First name is required',
    // },

    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
    },
  };

  form: FormGroup = new FormGroup({
    photoURL: new FormControl(''),
    accountName: new FormControl(''),
    // firstName: new FormControl('',[Validators.required]),
    // lastName: new FormControl('',[Validators.required]),
    jobTitle: new FormControl(''),
    organizationName: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    annualRevenue: new FormControl(''),
    companySize: new FormControl(''),
    phone: new FormControl(''),
    industry: new FormControl(''),
    address: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    zip: new FormControl(''),
    country: new FormControl(''),
    website: new FormControl(''),
    notes: new FormControl(''),
    leadSource: new FormControl(''),
    status: new FormControl(''),
    isabm: new FormControl(false)
  });

  //Delete Modal
  @ViewChild(AdvancedModalsComponent) deleteModal!: AdvancedModalsComponent;




  constructor(
    private notifService: NotificationService,
    private restService: RestService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || this.limit;
      this.getAccounts();
      const activeAccountId = this.route.snapshot.paramMap.get('id') as string;
      this.getActiveaccounts(activeAccountId);
      this.onPageChange({ page: this.currentPage })
    });
  }

  get photoURL(): FormControl {
    return this.form.get('photoURL') as FormControl;
  }

  get isabm(): FormControl {
    return this.form.get('isabm') as FormControl;
  }
  get accountName(): FormControl {
    return this.form.get('accountName') as FormControl;
  }

  get organizationName(): FormControl {
    return this.form.get('organizationName') as FormControl;
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get phone(): FormControl {
    return this.form.get('phone') as FormControl;
  }

  get address(): FormControl {
    return this.form.get('address') as FormControl;
  }
  get industry(): FormControl {
    return this.form.get('industry') as FormControl;
  }

  get city(): FormControl {
    return this.form.get('city') as FormControl;
  }

  get state(): FormControl {
    return this.form.get('state') as FormControl;
  }

  get zip(): FormControl {
    return this.form.get('zip') as FormControl;
  }

  get country(): FormControl {
    return this.form.get('country') as FormControl;
  }

  get annualRevenue(): FormControl {
    return this.form.get('annualRevenue') as FormControl;
  }
  get companySize(): FormControl {
    return this.form.get('companySize') as FormControl;
  }
  get website(): FormControl {
    return this.form.get('website') as FormControl;
  }

  get notes(): FormControl {
    return this.form.get('notes') as FormControl;
  }

  get leadSource(): FormControl {
    return this.form.get('leadSource') as FormControl;
  }

  get status(): FormControl {
    return this.form.get('status') as FormControl;
  }

  getActiveaccounts(id: string) {
    this.selectedaccounts = null;
    if (!id || id == 'all') {
      return;
    }
    this.restService.get(API.main.account, id).subscribe(
      (response: any) => {
        this.selectedaccounts = response.data;
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  }

  getAccounts(): void {
    this.restService
      .get(API.main.account, `?limit=${this.limit}&page=${this.currentPage}`)
      .subscribe(
        (response: any) => {
          this.accountList = response.data;
          this.totalItems = response.total
          console.log("accounts", this.accountList)
          console.log("accountname", this.accountName)
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
  }

  openCreateContact() {
    this.form.reset();
    this.isEdit = false;
    this.selectedaccounts = null;
    this.contactComposeCanvas.open();
  }

  openUpdateContact(contact: any) {
    this.selectedaccounts = contact;
    this.form.reset();
    this.form.patchValue(contact)
    this.isEdit = true;
    this.contactComposeCanvas.open();
  }

  openViewContact(data: any) {
    this.selectedData = data;
    this.form.reset();
    this.router.navigate(['accounts/view-account', data.id]);
  }

  onSubmit() {
    if (this.form.valid) {
      console.log("1st stage success")
      const formData: { [key: string]: string | null } = this.form.value;
      const data = Object.entries(formData)
        .filter(([_, value]) => value !== null)
        .reduce((acc, [key, value]) => {
          if (value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {} as { [key: string]: string });



      this.isLoading = true;
      if (this.isEdit) {
        this.restService.patch(API.main.account, this.selectedaccounts.id, data) // Ensure to use 'data' instead of 'this.form.value'
          .subscribe(
            (response: any) => {
              this.notifService.showSuccess('Account Updated Successfully.');
              this.getAccounts();
              this.isLoading = false;
              this.contactComposeCanvas.close();
            },
            (error) => {
              if (error.status == 500) {
                this.notifService.showError('Something Went Wrong! Try Again Later');
              } else {
                this.notifService.showError(error.error.message);
              }
              this.isLoading = false;
            },
          );
      }
      else {

        this.restService.post(API.main.account, data).subscribe({
          next: (response: any) => {
            this.notifService.showSuccess('Account Added Successfully.');
            this.getAccounts();
            this.changeDetectorRef.detectChanges();
            this.isLoading = false;
            this.contactComposeCanvas.close();
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status == 500) {
              this.notifService.showError('Something Went Wrong! Try Again Later');
            } else {
              this.notifService.showError(error.error.message);
            }
          },
        });
      }
    } else {
      markFormGroupAsDirty(this.form);
    }
  }

  onCancel() {
    this.contactComposeCanvas.close();
  }

  delete(data: any) {
    this.deleteModal.open(data)
  }

  confirmDelete = (data: any) => {
    this.restService.delete(API.main.contact, data.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Accounts Deleted Successfully.');
        this.getAccounts()
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  selectaccount(account: any) {

    this.selectedaccounts = account;
    this.router.navigate(['account', account.id])
    this.getActiveaccounts(account.id);
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getAccounts()
  }
}