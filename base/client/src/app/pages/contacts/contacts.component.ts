import { Component, ElementRef, Input, OnInit, ViewChild , ChangeDetectorRef, TemplateRef,} from '@angular/core';
import { ChatBotWidgetsComponent } from '../../widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AvatarService } from '../../shared/services/avatar.service';
import { NgbDropdownConfig,NgbDropdownModule, NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
 
import { NotificationService } from '../../shared/services/notification.service';
import { RestService } from '../../shared/services/rest.service';
import { SweetAlertService } from '../../shared/services/sweet-alart.service';
import { DeployScriptType } from '../zautosettings/settings/settings.component';
import { API } from '../../config/endpoint.config';
import { error } from 'console';
import { PaginationData } from 'src/app/common/intefaces';
import { ActivatedRoute, Router } from '@angular/router';
  

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  

})
export class ContactsComponent implements OnInit {
  @ViewChild('createUserOffcanvas') createUserOffcanvas: ElementRef | undefined;
  @ViewChild('updateUserOffcanvas') updateUserOffcanvas: ElementRef | undefined;
  @ViewChild('viewUserOffcanvas') viewUserOffcanvas: ElementRef | undefined;
  @ViewChild('deleteModal') deleteModal: ElementRef | undefined;
  @Input() chatBotWidget!: ChatBotWidgetsComponent;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;


  user: any = {};
  userList: any = [];
  selectedUser: any = undefined;
  showActionMenu = false;
  isEdit: boolean = false;
  photo1:any="https://imgs.search.brave.com/Mvm4VXGBy83NyhAuuehkrHYV0s4BvjtY6ZwR2dXCGro/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9ncGNh/dGFseXNpcy5ibG9i/LmNvcmUud2luZG93/cy5uZXQvZ3Bob3N0/ZWRjb250ZW50LXBy/b2Qvd1pVNzFpND1f/S2FtYXRoX05pa2hp/bF81MDB4NTAwLmpw/Zw" 
  Form: FormGroup;
  errorFeedback: any = { title: '', describe: '' };
  showDescription: boolean = true;
  showHTML: boolean = false;
  showScript: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  hoveredData: any=null;
  isHovered: any;
  itemPerPage: number = 10;
  submittedData: any[] = [];
  selectedData: any = '';
  limit = 5;
https: any;
isLeadScore: any=80;



  constructor(
    private avatarService: AvatarService,
    private modalService: NgbModal,
    private notifService: NotificationService,
    private restService: RestService,
    private offcanvasService: NgbOffcanvas,
    private changeDetectorRef: ChangeDetectorRef,
    private sweetAlertService: SweetAlertService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.Form = new FormGroup({
      photoURL: new FormControl(''),
      fullName: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
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
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || this.limit;
      this.getContacts(this.currentPage, this.limit);
      this.onPageChange({ page: this.currentPage })
      console.log("test",this.submittedData)
    });
  }

  ngAfterViewInit(): void {
    if (this.chatBotWidget) {
      this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
    }
  }

  getContacts(page: number = 1, limit: number = this.limit): void {
    this.restService
      .getAll(API.main.contact + `?page=${page}&limit=${limit}`) // Pass pagination parameters to the service
      .subscribe(
        (response: any) => {
          this.submittedData = response.data;
          this.totalPages = response.total; // Update data with response from API
          // Update any other pagination-related properties if necessary
          console.log(this.submittedData);
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );

  }

  deleteSubmittedData(data: any): void {
    const index = this.submittedData.indexOf(data);
    if (index !== -1) {
      this.submittedData.splice(index, 1);
    }
  }

  // onSubmitForm(): void {
  //   if (this.Form.valid) {
  //     this.submittedData.push({ ...this.Form.value });
  //     this.Form.reset();
  //   } else {
  //     console.log('Form is not valid');
  //     this.notifService.showError('Please fill out all required fields correctly');

  //   }
  // }

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
    this.router.navigate(['contacts/view-contacts', data.id]);
  }

  toggleDescription(): void {
    this.showDescription = !this.showDescription;
    this.showHTML = false;
    this.showScript = false;
  }

  toggleHTML(): void {
    this.showHTML = !this.showHTML;
    this.showDescription = false;
    this.showScript = false;
  }

  deplymentType = DeployScriptType;

  getAgentDeploy(type: DeployScriptType) {
    const botId = this.avatarService.getAvatarId();

    let script = '';
    if (type == DeployScriptType.BOTTOM_BAR) {
      script = `
      <script type="text/javascript">
        (function()
        {
            var rootElement = document.createElement("div");
            rootElement.id = "zauto_root";
            document.body.appendChild(rootElement);
            d = document; 
            s = d.createElement("script");     
            s.async = 1;     
            s.src = "${API.rootURL}api/agents/widget/${botId}.js";
            d.getElementsByTagName("head")[0].appendChild(s);
        })();
      </script>
      `;
    }

    return script;
  }

  toggleScript(): void {
    this.showScript = !this.showScript;
    this.showDescription = false;
    this.showHTML = false;
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

    this.restService.post(API.main.contact, data).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.offcanvasService.dismiss();
        this.notifService.showSuccess('User Added Successfully.');
        this.getContacts();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    });
  }


  onUpdateuserSubmit(): void {
    const updateContactFields: any[] = [];
    if (this.Form.get('photoUrl')?.value) {
      updateContactFields.push({
        label: 'Photo Url',
        value: this.Form.value.photoUrl,
      });
    }
    if (this.Form.get('fullName')?.value) {
      updateContactFields.push({
        label: 'Full Name',
        value: this.Form.value.fullname,
      });
    }

    if (this.Form.get('lastName')?.value) {
      updateContactFields.push({
        label: 'Last Name',
        value: this.Form.value.lastname,
      });
    }
    if (this.Form.get('jobTitle')?.value) {
      updateContactFields.push({
        label: 'Jobtitle',
        value: this.Form.value.jobtitle,
      });
    }
    if (this.Form.get('organizationName')?.value) {
      updateContactFields.push({
        label: 'Organization Name',
        value: this.Form.value.website,
      });
    }
    if (this.Form.get('email')?.value) {
      updateContactFields.push({
        label: 'Email',
        value: this.Form.value.address,
      });
    }
    if (this.Form.get('phone')?.value) {
      updateContactFields.push({
        label: 'Phone',
        value: this.Form.value.city,
      });
    }
    if (this.Form.get('address')?.value) {
      updateContactFields.push({
        label: 'Address',
        value: this.Form.value.state,
      });
    }
    if (this.Form.get('zip')?.value) {
      updateContactFields.push({
        label: 'Zip',
        value: this.Form.value.zip,
      });
    }
    if (this.Form.get('country')?.value) {
      updateContactFields.push({
        label: 'Country',
        value: this.Form.value.country,
      });
    }
    if (this.Form.get('city')?.value) {
      updateContactFields.push({
        label: 'City',
        value: this.Form.value.city,
      });
    }

    if (this.Form.get('State')?.value) {
      updateContactFields.push({
        label: 'State',
        value: this.Form.value.state,
      });
    }
    if (this.Form.get('notes')?.value) {
      updateContactFields.push({
        label: 'Notes',
        value: this.Form.value.notes,
      });
    }
    if (this.Form.get('source')?.value) {
      updateContactFields.push({
        label: 'Source',
        value: this.Form.value.source,
      });
    }
    if (this.Form.get('website')?.value) {
      updateContactFields.push({
        label: 'Website',
        value: this.Form.value.website,
      });
    }
    if (this.Form.get('status')?.value) {
      updateContactFields.push({
        label: 'Status',
        value: this.Form.value.status,
      });
    }
    if (this.Form.valid) {
      const updatedContactData = {
        accountName: this.Form.value.accountName,
        email: this.Form.value.email,
        phone: this.Form.value.phone,
        updateContactFields,
      };
      this.restService
        .patch(API.main.contact, this.user.id, this.Form.value)
        .subscribe(
          (response: any) => {
            this.notifService.showSuccess('Account Updated Successfully.');
            console.log("lastname", updatedContactData)
            this.getContacts();
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


  openUpdateUser(user: any) {
    this.user = user; // Store the selected user data
    this.Form.reset();
    console.log("test", user)
    this.Form.patchValue(user)

    // this.Form.get('parentAccountId')?.setValue(user?.parentAccountId);
    // this.Form.get('accountName')?.setValue(user?.accountName);
    // this.Form.get('industry')?.setValue(user?.industry);
    // this.Form.get('companySize')?.setValue(user?.companySize);
    // this.Form.get('annualRevenue')?.setValue(user?.annualRevenue);
    // this.Form.get('accountType')?.setValue(user?.accountType);
    // this.Form.get('website')?.setValue(user?.website);
    // this.Form.get('address')?.setValue(user?.address);
    // this.Form.get('city')?.setValue(user?.city);
    // this.Form.get('state')?.setValue(user?.state);
    // this.Form.get('zip')?.setValue(user?.zip);
    // this.Form.get('country')?.setValue(user?.country);
    // this.Form.get('phone')?.setValue(user?.phone);
    // this.Form.get('email')?.setValue(user?.email);
    // this.Form.get('socialMedia')?.setValue(user?.socialMedia);
    // this.Form.get('notes')?.setValue(user?.notes);
    // this.Form.get('source')?.setValue(user?.source);
    // this.Form.get('status')?.setValue(user?.status);
    // this.Form.get('isabm')?.setValue(user?.abm);


    this.resetErrorFeedback();
    // this.Form.patchValue(user); // Pre-fill the form with the user data
    this.offcanvasService.open(this.updateUserOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  // onUpdateuserSubmit(): void {
  //   if (this.Form.valid && this.selectedData) {
  //     const updatedUserData = this.Form.value;
  //     // Assuming this.selectedData contains the ID of the selected user
  //     this.restService.put(API.main.contact, this.selectedData.id, updatedUserData)
  //       .subscribe({
  //         next: (response: any) => {
  //           console.log(response);
  //           // Close the offcanvas
  //           this.offcanvasService.dismiss();
  //           // Reset the form after submission
  //           this.Form.reset();
  //           // Optionally, update the user list or perform any necessary actions
  //           this.getContacts(this.currentPage);
  //           // Show a success notification
  //           this.notifService.showSuccess('User Updated Successfully.');
  //         },
  //         error: (error) => {
  //           console.error(error);
  //           // Show an error notification if the update fails
  //           this.notifService.showError(error.error.message);
  //         },
  //       });
  //   } else {
  //     // Mark form controls as touched to display validation errors
  //     this.Form.markAllAsTouched();
  //   }
  // }



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
        this.getContacts()
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };


  onSubmit = (userForm: any) => {
    this.modalService.dismissAll();
    this.notifService.showSuccess('User Added Successfully');
  };

  closeModal = () => {
    this.user = {};
    this.isEdit = false;
    this.modalService.dismissAll();
  };

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getContacts(this.currentPage, this.limit)

  }
  toggleActionMenu() {
    this.showActionMenu = !this.showActionMenu;
  }
    getCountryFlagClass(countryCode: string): string {
      const countryCodes: { [key: string]: string } = {
        unitedstates: 'us',
        india: 'in',
        
      };
      return countryCodes[countryCode.toLowerCase()] || 'hi';
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
  emailFormControl = new FormControl('', [

    Validators.email,

    Validators.required,
  ]);
  onMouseEnter(data: any) {
    if(data){
    this.hoveredData=data;
    console.log("hovereddata",this.hoveredData)
    }
    }

    openModal(data:any ) {
      if (this.hoveredData) {
        const modalRef = this.modalService.open(this.modalContent, {
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body'
        });
    
        modalRef.componentInstance.hoveredData = this.hoveredData;
    
      } 
    }}

    
