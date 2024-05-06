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
  selector: 'app-accounts',
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})


export class AccountsComponent implements OnInit {
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
  errorFeedback: any = { title: '', describe: '' };
  showDescription: boolean = true;
  showHTML: boolean = false;
  showScript: boolean = false;
  currentPage: number = 1;
  totalPages:number=1;
  itemPerPage: number = 10;
  submittedData: any[] = [];
  selectedData: any = null; 



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
      parentaccountId:[''],
      photoUrl:[''],
      accountname: [''],
      industry:[''],
      companySize:[''],
      annualRevenue:[''],
      accountType:[''],
      website:[''],       
      address:[''],        
      city:[''],            
      state:[''],           
      zip :[''],  
      country:[''],                
      phone: [''],
      email:[''],
      socialMedia:[''],
      notes :[''],          
      source :[''],  
      status:[''],       
    });
  }


  ngOnInit(): void {
    this.getAccounts();
  }
  ngAfterViewInit(): void {
    if(this.chatBotWidget) {
      this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
    }
  }
  getAccounts(page: number = 1, limit: number = 10): void {
    const queryParams = { page, limit }; // Define pagination parameters
    const endpoint = API.main.account + `?${queryParams}`;
    this.restService.getAll(endpoint) // Pass pagination parameters to the service
      .subscribe((response: any) => {
        this.submittedData = response.data; 
        this.totalPages = Math.ceil(response.totalCount / limit); // Update data with response from API
        // Update any other pagination-related properties if necessary
      }, (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      });
}



  deleteSubmittedData(data: any): void {
    const index = this.submittedData.indexOf(data);
    if (index !== -1) {
      this.submittedData.splice(index, 1);
    }
  }

  onSubmitForm(): void {
    this.submittedData.push({ ...this.Form.value });
    this.Form.reset()
  
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
    const name = this.Form.value.name || '';
    const email = this.Form.value.email || '';
    const password = this.Form.value.password || '';

    if (this.Form.valid) {
      const data = {
        name: name,
        email: email,
        password: password,
      };
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
    } else {
      if (name.length <= 0) {
        this.errorFeedback.name = 'Name required.';
      }
      if (email.length <= 0) {
        this.errorFeedback.email = 'Email required.';
      }
      if (password.length <= 0) {
        this.errorFeedback.password = 'password required.';
      }
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
    this.getAccounts(pageNumber);
  }



  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = '';
    }
  }
}
