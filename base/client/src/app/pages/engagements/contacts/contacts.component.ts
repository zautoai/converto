import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { API } from 'src/app/config/endpoint.config';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],


})
export class ContactsComponent implements OnInit {
  @ViewChild(AdvanceOffcanvasComponent) contactComposeCanvas!: AdvanceOffcanvasComponent;
  @ViewChild('viewContactOffcanvas') viewContactOffcanvas: ElementRef | undefined;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  isLoading:boolean = false;
  contactList: any = [];
  selectedContact: any = undefined;
  isEdit: boolean = false;
  showDescription: boolean = true;
  currentPage: number = 1;
  totalPages: number = 1;
  hoveredData: any = null;
  itemPerPage: number = 10;
  selectedData: any = '';
  limit = 5;
  totalItems: number = 0;

  errorMessages = {
    firstName: {
      required: 'First name is required',
    },
    lastName: {
      required: 'Last name is required',
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
    },
  };
    
  form:FormGroup = new FormGroup({
    photoURL: new FormControl(''),
    fullName: new FormControl(''),
    firstName: new FormControl('',[Validators.required]),
    lastName: new FormControl('',[Validators.required]),
    jobTitle: new FormControl(''),
    organizationName: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    address: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    zip: new FormControl(''),
    country: new FormControl(''),
    website: new FormControl(''),
    notes: new FormControl(''),
    leadSource: new FormControl(''),
    status: new FormControl(''),
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
      this.getContacts();
      const activeContactId = this.route.snapshot.paramMap.get('id') as string;
      this.getActiveContact(activeContactId);
      this.onPageChange({ page: this.currentPage })
    });
  }

  get photoURL(): FormControl {
    return this.form.get('photoURL') as FormControl;
  }

  get fullName(): FormControl {
    return this.form.get('fullName') as FormControl;
  }

  get firstName(): FormControl {
    return this.form.get('firstName') as FormControl;
  }

  get lastName(): FormControl {
    return this.form.get('lastName') as FormControl;
  }

  get jobTitle(): FormControl {
    return this.form.get('jobTitle') as FormControl;
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

  getActiveContact(id:string){
    this.selectedContact = null;
    if(!id || id == 'all') {
      return;
    }
    this.restService.get(API.main.contact, id).subscribe(
      (response: any) => {
        this.selectedContact = response.data;
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  }

  getContacts(): void {
    this.restService
      .get(API.main.contact, `?limit=${this.limit}&page=${this.currentPage}`)
      .subscribe(
        (response: any) => {
          this.contactList = response.data;
          this.totalItems = response.total
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
    this.selectedContact = null;
    this.contactComposeCanvas.open();
  }
  
  openUpdateContact(contact: any) {
    this.selectedContact = contact; 
    this.form.reset();
    this.form.patchValue(contact)
    this.isEdit = true;
    this.contactComposeCanvas.open();
  }

  openViewContact(data: any) {
    this.selectedData = data;
    this.form.reset();
    this.router.navigate(['contacts/view-contacts', data.id]);
  }

  onSubmit() {
    if(this.form.valid)
    {
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
      if(this.isEdit)
      {
        this.restService.patch(API.main.contact, this.selectedContact.id, this.form.value)
        .subscribe(
          (response: any) => {
            this.notifService.showSuccess('Account Updated Successfully.');
            this.getContacts();
            this.isLoading = false;
            this.contactComposeCanvas.close();
          },
          (error) => {
            if(error.status == 500)
            {
              this.notifService.showError('Something Went Wrong! Try Again Later');
            }
            else{
              this.notifService.showError(error.error.message);
            }
            this.isLoading = false;
          },
        );
      }
      else
      {
        this.restService.post(API.main.contact, data).subscribe({
          next: (response: any) => {
            this.notifService.showSuccess('Contact Added Successfully.');
            this.getContacts();
            this.changeDetectorRef.detectChanges();
            this.isLoading = false;
            this.contactComposeCanvas.close();
          },
          error: (error) => {
            this.isLoading = false;
            if(error.status == 500)
            {
              this.notifService.showError('Something Went Wrong! Try Again Later');
            }
            else{
              this.notifService.showError(error.error.message);
            }
          },
        });
      }
    }
    else{
      markFormGroupAsDirty(this.form);
    }
  }

  onCancel()
  {
    this.contactComposeCanvas.close();
  }

  delete(data: any) {
    this.deleteModal.open(data)
  }

  confirmDelete = (data: any) => {
    this.restService.delete(API.main.contact, data.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Accounts Deleted Successfully.');
        this.getContacts()
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  selectContact(contact:any)
  {
    this.selectedContact = contact;
    this.router.navigate(['contacts', contact.id])
    this.getActiveContact(contact.id);
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getContacts()
  }
}
