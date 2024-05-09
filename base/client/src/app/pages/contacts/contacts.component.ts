import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatBotWidgetsComponent } from '../../widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AvatarService } from '../../shared/services/avatar.service';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/services/notification.service';
import { RestService } from '../../shared/services/rest.service';
import { SweetAlertService } from '../../shared/services/sweet-alart.service';
import { DeployScriptType } from '../zautosettings/settings/settings.component';
import { API } from '../../config/endpoint.config';

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

  user: any = {};
  userList: any = [];
  selectedUser: any = undefined;
  isEdit: boolean = false;
  Form: FormGroup;
  errorFeedback: any = { title: '', describe: '' };
  showDescription: boolean = true;
  showHTML: boolean = false;
  showScript: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  itemPerPage: number = 10;
  submittedData: any[] = [];
  selectedData: any = '';

  constructor(
    private avatarService: AvatarService,
    private modalService: NgbModal,
    private notifService: NotificationService,
    private restService: RestService,
    private offcanvasService: NgbOffcanvas,
    private formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
  ) {
    this.Form = this.formBuilder.group({
      photoUrl: [''],
      fullName: [''],
      firstName: [''],
      lastName: [''],
      jobTitle: [''],
      organizationName: [''],
      email: [''],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      country: [''],
      website: [''],
      notes: [''],
      leadSource: [''],
      status: [''],
    });
  }

  ngOnInit(): void {
    this.getContacts();
  }

  ngAfterViewInit(): void {
    if (this.chatBotWidget) {
      this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
    }
  }

  getContacts(page: number = 1, limit: number = 10): void {
    this.restService
      .getAll(API.main.contact) // Pass pagination parameters to the service
      .subscribe(
        (response: any) => {
          this.submittedData = response.data;
          this.totalPages = Math.ceil(response.totalCount / limit); // Update data with response from API
          // Update any other pagination-related properties if necessary
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
    console.log(this.submittedData);
  }

  deleteSubmittedData(data: any): void {
    const index = this.submittedData.indexOf(data);
    if (index !== -1) {
      this.submittedData.splice(index, 1);
    }
  }

  onSubmitForm(): void {
    this.submittedData.push({ ...this.Form.value });
    this.Form.reset();
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

  onCreateuserSubmit(formData: any) {
    const data: any = {};

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        data[key] = formData[key] || '';
      }
    }

    this.restService.post(API.main.orgUser, data).subscribe({
      next: (response: any) => {
        console.log(response);
        this.offcanvasService.dismiss();
        this.notifService.showSuccess('User Added Successfully.');
      },
      error: (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    });
  }


  onUpdateuserSubmit() {
    this.resetErrorFeedback(); // Reset error feedback messages

    const formData: { [key: string]: any } = this.Form.value; // Get form data

    if (this.Form.valid) { // Check if the form is valid
        const data: { [key: string]: any } = {}; // Initialize data object

        // Loop through form data to populate the data object
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                data[key] = formData[key] || ''; // Assign form value to data object or empty string
            }
        }

        console.log('Form value:', this.Form.value);
        console.log('Data to be patched:', data); // Log data before making the API call

        // Make PATCH request to update user data
        this.restService.patch(API.main.contact, this.user.id, data).subscribe({
            next: (response: any) => {
                console.log('Patch response:', response); // Log API response
                this.offcanvasService.dismiss(); // Dismiss the offcanvas
                this.notifService.showSuccess('User Updated Successfully.'); // Show success notification
            },
            error: (error) => {
                console.error('Patch error:', error); // Log API error
                this.notifService.showError(error.error.message); // Show error notification
            },
        });
    } else {
        
        Object.keys(formData).forEach((key) => {
            if (formData[key].trim().length <= 0) {
                this.errorFeedback[key] = `${key} is required.`;
            }
        });
    }
}


  openUpdateUser(user: any) {
    this.user = user; // Store the selected user data
    this.Form.reset();
    this.resetErrorFeedback();
    this.Form.patchValue(user); // Pre-fill the form with the user data
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

  onPageChange(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getContacts(pageNumber);
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = '';
    }
  }
}
