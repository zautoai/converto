
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  Input,
  Output,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { ChatBotWidgetsComponent } from 'src/app/widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { EventEmitter } from 'stream';
import { DeployScriptType } from '../zautosettings/settings/settings.component';


@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss'
})
export class FormBuilderComponent implements OnInit {
  @ViewChild('createUserOffcanvas') createUserOffcanvas: ElementRef | undefined;
  @ViewChild('updateUserOffcanvas') updateUserOffcanvas: ElementRef | undefined;
  @ViewChild('viewUserOffcanvas') viewUserOffcanvas: ElementRef | undefined;
  @ViewChild('deleteModal') deleteModal: ElementRef | undefined;
 @Input()chatBotWidget! : ChatBotWidgetsComponent;


  user: any = {};
  userList: any = [];
  selectedUser: any = undefined;
  isEdit: boolean = false;
  Form: FormGroup;
  errorFeedback: any = { name: '', email: '', password: '' };
  showDescription: boolean = true;
  showHTML: boolean = false;
  showScript: boolean = false;
  currentPage: number = 1;
  itemPerPage: number = 10;
  submittedData: any[] = [];
  selectedData: any = null; 
  selectedCheckboxes: string[] = [];

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
      title: [''],
      description: [''],
      name: false,
      label: false,
      contactdetails: false
    });
  }


  ngOnInit(): void {
    this.getUsers();
  }
  ngAfterViewInit(): void {
    if(this.chatBotWidget) {
      this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
    }
  }


  
  deleteSubmittedData(data: any): void {
    const index = this.submittedData.indexOf(data);
    if (index !== -1) {
      this.submittedData.splice(index, 1);
    }
  }

  onSubmitForm(): void {
    this.submittedData.push({ ...this.Form.value });

    this.selectedCheckboxes = [];
    if (this.Form.get('name')?.value) {
      this.selectedCheckboxes.push('Name');
    }
    if (this.Form.get('label')?.value) {
      this.selectedCheckboxes.push('Email');
    }
    if (this.Form.get('contactdetails')?.value) {
      this.selectedCheckboxes.push('Phone Number');
    }
    this.offcanvasService.dismiss();
    console.log('Form submitted with selected checkboxes:', this.selectedCheckboxes);

  
  }

  getUsers = () => {
    this.restService
      .get(
        API.main.orgUser,
        `?limit=${this.itemPerPage}&page=${this.currentPage}`,
      )
      .subscribe(
        (response: any) => {
          this.userList = response;
        },
        (error) => {
          console.log(error);
          this.notifService.showError(error.error.message);
        },
      );
  };

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
  openViewUser(data:any) {
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
    const botId = this.avatarService.getAvatarId()

    let script = "";
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
      `
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
    const title = this.Form.value.title || '';
    const description = this.Form.value.description || '';
  

    if (this.Form.valid) {
      const data = {
        title: "title",
        description: "description",
        isActive: true,
         createLeadField: [
          {
            label: "string",
            type: "TEXT",
            contactField: "string",
            isRequired: true
          }
        ]
      };
      console.log(data);
      this.restService.post(API.main.formbuilder, data).subscribe({
        next: (response: any) => {
          console.log(response);
          this.offcanvasService.dismiss();
          this.notifService.showSuccess('User Added Successfully.');
          this.getUsers();
        },
        error: (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      });

    } else {
      if (title.length <= 0) {
        this.errorFeedback.name = 'Name required.';
      }
      if (description.length <= 0) {
        this.errorFeedback.password = 'password required.';
      }
    }
  }


  openUpdateUser(user: any) {
    this.user = user;
    this.Form.reset();
    this.resetErrorFeedback();
    this.Form.patchValue(user);
    this.offcanvasService.open(this.updateUserOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  onUpdateuserSubmit(): void {
    if (this.Form.valid) {
      const updatedUserData = this.Form.value;
      // Implement your update logic using updatedUserData
      console.log('Updated User Data:', updatedUserData);

      // Close the offcanvas
      this.offcanvasService.dismiss();
      // Reset the form after submission
      this.Form.reset();
    } else {
      // Mark form controls as touched to display validation errors
      this.Form.markAllAsTouched();
    }
  }


  delete = (user: any) => {
    this.user = user;

    this.sweetAlertService.warning(
      'Delete user',
      'Are you sure you want to delete ?',
      ['Delete', 'Cancel'],
      (confirm: any) => {
        if (confirm.isConfirmed) {
          this.confirmDelete();
        }
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

  confirmDelete = () => {
    this.restService.delete(API.main.orgUser, this.user.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('User Deleted Successfully.');
        this.getUsers();
        this.closeModal();
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  onPageChange(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getUsers();
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = '';
    }
  }
}
