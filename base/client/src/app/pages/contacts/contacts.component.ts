import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, } from '@angular/core';
import { ChatBotWidgetsComponent } from '../../widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AvatarService } from '../../shared/services/avatar.service';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/services/notification.service';
import { RestService } from '../../shared/services/rest.service';
import { SweetAlertService } from '../../shared/services/sweet-alart.service';
import { DeployScriptType } from '../zautosettings/settings/settings.component';
import { API } from '../../config/endpoint.config';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],


})
export class ContactsComponent implements OnInit {
  @ViewChild(AdvanceOffcanvasComponent) contactComposeCanvas!: AdvanceOffcanvasComponent;
  @ViewChild('viewContactOffcanvas') viewContactOffcanvas: ElementRef | undefined;
  @Input() chatBotWidget!: ChatBotWidgetsComponent;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  isLoading:boolean = false;
  contact: any = {};
  contactList: any = [];
  selectedContact: any = undefined;
  showActionMenu = false;
  isEdit: boolean = false;
  photo1: any = "https://imgs.search.brave.com/Mvm4VXGBy83NyhAuuehkrHYV0s4BvjtY6ZwR2dXCGro/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9ncGNh/dGFseXNpcy5ibG9i/LmNvcmUud2luZG93/cy5uZXQvZ3Bob3N0/ZWRjb250ZW50LXBy/b2Qvd1pVNzFpND1f/S2FtYXRoX05pa2hp/bF81MDB4NTAwLmpw/Zw"
  errorFeedback: any = { title: '', describe: '' };
  showDescription: boolean = true;
  showHTML: boolean = false;
  showScript: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  hoveredData: any = null;
  isHovered: any;
  itemPerPage: number = 10;
  selectedData: any = '';
  limit = 5;
  totalItems: number = 0;
  https: any;
  isLeadScore: any = 80;
  clickedData: any;

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
    private avatarService: AvatarService,
    private modalService: NgbModal,
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

  ngAfterViewInit(): void {
    if (this.chatBotWidget) {
      this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
    }
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
    this.contact = null;
    this.contactComposeCanvas.open();
  }
  
  openUpdateContact(contact: any) {
    this.contact = contact; 
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
        this.restService.patch(API.main.contact, this.contact.id, this.form.value)
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
        console.log(this.contact);
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
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getContacts()
  }

  onMouseEnter(data: any) {
    if (data) {
      this.clickedData = data;
      console.log("hovereddata", this.clickedData)
    }
  }

  openModal(data: any) {
    if (this.hoveredData) {
      const modalRef = this.modalService.open(this.modalContent, {
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body'
      });

      modalRef.componentInstance.hoveredData = this.hoveredData;

    }
  }
}
