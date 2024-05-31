import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { API } from 'src/app/config/endpoint.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { ChatBotWidgetsComponent } from 'src/app/widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { DeployScriptType } from '../zautosettings/settings/settings.component';
import { PaginationData } from 'src/app/common/intefaces';
import { ActivatedRoute } from '@angular/router';

interface LeadFormSchema {
  title: string;
  description: string;
  isActive: boolean;
  createLeadField: LeadFormField[];
}

interface LeadFormField {
  label: string;
  type: 'TEXT' | string; // Restrict type to 'TEXT' or allow for future expansion
  contactField: string;
  isRequired: boolean;
}

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})



export class FormBuilderComponent implements OnInit {
  @ViewChild('createFormOffcanvas') createFormOffcanvas: ElementRef | undefined;
  @ViewChild('updateFormOffcanvas') updateFormOffcanvas: ElementRef | undefined;
  @ViewChild('viewFormOffcanvas') viewFormOffcanvas: ElementRef | undefined;
  @ViewChild('deleteModal') deleteModal: ElementRef | undefined;
  @Input() chatBotWidget!: ChatBotWidgetsComponent;

  form: any = {};
  formList: any = [];
  selectedForm: any = undefined;
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
  totalItems: number = 1;
  limit = 20;
  selectedCheckboxes: string[] = [];
  htmlData: string = '';
  jsData: string = '';

  constructor(
    private avatarService: AvatarService,
    private modalService: NgbModal,
    private notifService: NotificationService,
    private restService: RestService,
    private offcanvasService: NgbOffcanvas,
    private formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    this.Form = this.formBuilder.group({
      title: [''],
      description: [''],
      name: [false],
      label: [false],
      contactdetails: [false],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || this.limit;
      this.getForms();
      this.onPageChange({ page: this.currentPage })
    });

  }
  ngAfterViewInit(): void {
    if (this.chatBotWidget) {
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

  }

  getForms(): void {
    this.restService
      .get(API.main.formbuilder, `?limit=${this.limit}&page=${this.currentPage}`)
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
  };

  openCreateForm() {
    this.Form.reset();
    this.resetErrorFeedback();
    this.offcanvasService.open(this.createFormOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }
  openViewForm(data: any) {
    this.selectedData = data;
    this.Form.reset();
    this.resetErrorFeedback();
    this.offcanvasService.open(this.viewFormOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  toggleDescription(): void {
    this.showDescription = true;
    this.showHTML = false;
    this.showScript = false;
  }

  toggleHTML(): void {
    this.getHtmlScript(this.selectedData.id);
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
    this.getJsScript(this.selectedData.id);
  }

  onCreateformSubmit() {
    this.resetErrorFeedback();
    this.onSubmitForm();
    const title = this.Form.value.title || '';
    const description = this.Form.value.description || '';
    if (this.Form.valid) {
      const data = {
        title: title,
        description: description,
        isActive: true,
        createLeadField: this.selectedCheckboxes.map((checkbox) => {
          return {
            label: checkbox,
            type:
              checkbox === 'Phone Number'
                ? 'NUMBER'
                : checkbox === 'Email'
                  ? 'EMAIL'
                  : 'TEXT',
            contactField:
              checkbox === 'Phone Number'
                ? 'phone'
                : checkbox === 'Email'
                  ? 'email'
                  : 'fullName',
            isRequired: true,
          };
        }),
      };
      this.restService.post(API.main.formbuilder, data).subscribe({
        next: (response: any) => {
          console.log(response);
          this.getForms();
          this.offcanvasService.dismiss();
          this.notifService.showSuccess('Form Added Successfully.');
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

  openUpdateForm(data: any) {
    this.selectedData = data;
    this.Form.reset();
    this.Form.get('title')?.setValue(data?.title);
    this.Form.get('description')?.setValue(data?.description);
    const leadFormFields = data?.LeadFormField.map((field: any) => field.label);
    console.log(leadFormFields);

    this.Form.get('name')?.setValue(leadFormFields.includes('Name'));
    this.Form.get('label')?.setValue(leadFormFields.includes('Email'));
    this.Form.get('contactdetails')?.setValue(
      leadFormFields.includes('Phone Number'),
    );
    this.offcanvasService.open(this.updateFormOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  onUpdateformSubmit(): void {
    const updateLeadField: any[] = [];

    if (this.Form.get('name')?.value) {
      updateLeadField.push({
        label: 'Name',
        type: 'TEXT',
        contactField: 'fullName',
        isRequired: true,
      });
    }
    if (this.Form.get('label')?.value) {
      updateLeadField.push({
        label: 'Email',
        type: 'EMAIL',
        contactField: 'email',
        isRequired: true,
      });
    }
    if (this.Form.get('contactdetails')?.value) {
      updateLeadField.push({
        label: 'Phone Number',
        type: 'NUMBER',
        contactField: 'phone',
        isRequired: true,
      });
    }

    if (this.Form.valid) {
      const updatedFormData = {
        title: this.Form.value.title,
        description: this.Form.value.description,
        updateLeadField,
      };
      this.restService
        .patch(API.main.formbuilder, this.selectedData.id, updatedFormData)
        .subscribe(
          (response: any) => {
            console.log(response);
            this.notifService.showSuccess('Form Updated Successfully.');
            this.getForms();
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
    this.form = data;
    this.sweetAlertService.warning(
      'Delete form',
      'Are you sure you want to delete ?',
      ['Delete', 'Cancel'],
      (confirm: any) => {
        if (confirm.isConfirmed) {
          this.confirmDelete();
        }
      },
    );
  };

  onSubmit = (formForm: any) => {
    this.modalService.dismissAll();
    this.notifService.showSuccess('Form Added Successfully');
  };

  closeModal = () => {
    this.form = {};
    this.isEdit = false;
    this.modalService.dismissAll();
  };

  confirmDelete = () => {
    this.restService.delete(API.main.formbuilder, this.form.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Form Deleted Successfully.');
        this.getForms();
        this.closeModal();
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  // onPageChange(pageNumber: number) {
  //   this.currentPage = pageNumber;
  //   this.getForms();
  // }
  onPageChange(event: any) {
    this.currentPage = event.page;

    this.getForms()
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = '';
    }
  }

  getHtmlScript(id: string) {
    const { orgId } = this.authService.getUser();
    this.restService
      .get(API.main.formbuilder + `/${orgId}/form/html`, id)
      .subscribe(
        (response: any) => {
          this.showHTML = true;
          this.showScript = false;
          this.showDescription = false;
          this.htmlData = response.data;
        },
        (error) => {
          console.error(error.error);
          this.notifService.showError(error.error.message);
        },
      );
  }

  getJsScript(id: string) {
    const { orgId } = this.authService.getUser();
    const script = `<script type="text/javascript" src="${API.main.formbuilder}/${orgId}/form/script/${id}.js"/></script>
    <script>
    function  callback(error, data) {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('Data received:', data);
            alert('Form submited')
        }
    }
    init(callback);
  </script>`;
    this.jsData = script;
    this.showDescription = false;
    this.showHTML = false;
    this.showScript = true;
  }
}
