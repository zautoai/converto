import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { API } from 'src/app/config/endpoint.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';


@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})

export class FormBuilderComponent implements OnInit {

  @ViewChild(AdvanceOffcanvasComponent) formComposeOffcanvas!: AdvanceOffcanvasComponent;
  @ViewChild(AdvancedModalsComponent) deleteFormModal!: AdvancedModalsComponent;

  form: FormGroup = new FormGroup({
    title: new FormControl('',[Validators.required,Validators.minLength(3),Validators.maxLength(50)]),
    description: new FormControl(''),
    name: new FormControl(false),
    email: new FormControl(false),
    phoneNumber: new FormControl(false),
  });

  errorMessages = {
    title: {
      required: 'Title is required',
      minlength: 'Title must be at least 3 characters long',
      maxlength: 'Title must be less than 50 characters long',
    },
  };

  formData: any;
  selectedForm: any = undefined;
  isEdit: boolean = false;
  showDescription: boolean = true;
  showHTML: boolean = false;
  showScript: boolean = false;
  currentPage: number = 1;
  itemPerPage: number = 10;
  submittedData: any[] = [];
  totalItems: number = 1;
  limit = 20;
  selectedCheckboxes: string[] = [];
  htmlContent: string = '';
  scriptContent: string = '';

  isLoading:boolean = false

  constructor(
    private notifService: NotificationService,
    private restService: RestService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  get title():FormControl{
    return this.form.get('title') as FormControl;
  }

  get description():FormControl{
    return this.form.get('description') as FormControl;
  }

  get name():FormControl{
    return this.form.get('name') as FormControl;
  }

  get email():FormControl{
    return this.form.get('email') as FormControl;
  }

  get phoneNumber():FormControl{
    return this.form.get('phoneNumber') as FormControl;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || this.limit;
      this.getForms();
      this.onPageChange({ page: this.currentPage })
      const activeFormId = this.route.snapshot.paramMap.get('id') as string;
      this.getActiveForm(activeFormId);
    });

  }

  deleteSubmittedData(data: any): void {
    const index = this.submittedData.indexOf(data);
    if (index !== -1) {
      this.submittedData.splice(index, 1);
    }
  }

  getForms(): void {
    this.restService
      .get(API.main.formbuilder, `?limit=${this.limit}&page=${this.currentPage}`)
      .subscribe(
        (response: any) => {
          this.formData = response;
          this.totalItems = response.total
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
  };

  openCreateForm() {
    this.isEdit = false;
    this.form.reset();
    this.formComposeOffcanvas.open();
  }

  openUpdateForm(data: any) {
    this.isEdit = true;
    this.selectedForm = data;
    this.form.reset();
    this.form.patchValue({
      title: data.title,
      description: data.description,
      name: data.LeadFormField.find((field: any) => field.label === 'name') ? true : false,
      email: data.LeadFormField.find((field: any) => field.label === 'email') ? true : false,
      phoneNumber: data.LeadFormField.find((field: any) => field.label === 'phone') ? true : false,
    });
    this.formComposeOffcanvas.open();
  }

  openDeleteForm(entity:any){
    this.deleteFormModal.open(entity);
  }

  closeComposeCanvas(){
    this.formComposeOffcanvas.close();
  }

  onSubmitForm(): void {
    if(this.form.valid)
    {
      this.isLoading = true;
      const data = this.getFormpayload(); 
      if(data.createLeadField.length <= 0){
        this.isLoading = false;
        this.notifService.showError('Please select at least one field.');
        return;
      }      
      if(this.isEdit)
      {
        if(!this.selectedForm) return;
        this.restService.patch(API.main.formbuilder, this.selectedForm.id,data).subscribe({
          next: (response: any) => {
            this.getForms();
            this.notifService.showSuccess('Form Updated Successfully.');
            this.isLoading = false;
            this.closeComposeCanvas();
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
      else
      {
        this.restService.post(API.main.formbuilder, data).subscribe({
          next: (response: any) => {
            this.getForms();
            this.notifService.showSuccess('Form Added Successfully.');
            this.isLoading = false;
            this.closeComposeCanvas();
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
    else
    {
      this.isLoading = false;
      markFormGroupAsDirty(this.form);
    }
  }

  getActiveForm(id:string){
    this.selectedForm = null;
    if(!id || id == 'all') {
      return;
    }
    this.restService.get(API.main.formbuilder, id).subscribe(
      (response: any) => {
        this.selectedForm = response.data;
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
    this.getHtmlScript(id);
    this.getJsScript(id);
  }

  selectForm(entity:any){
    this.selectedForm = entity;
    this.getHtmlScript(entity.id);
    this.getJsScript(entity.id);
    this.router.navigate(['form-builder', entity.id]);
    this.getActiveForm(entity.id);
  }

  private getFormpayload() {
    const payload = {
      title: this.title.value,
      description: this.description.value,
      createLeadField: [
        ... (this.name.value == true) ? [{
          label: "name",
          type: "TEXT",
          contactField: "name",
          isRequired: true
        }] : [],
        ... (this.email.value == true) ? [{
          label: "email",
          type: "EMAIL",
          contactField: "email",
          isRequired: true
        }] : [],
        ... (this.phoneNumber.value == true) ? [{
          label: "phoneNumber",
          type: "TEXT",
          contactField: "phoneNumber",
          isRequired: true
        }] : []
      ]
    }
    return payload
  }

  onDeleteSubmit(entity:any) {
    if(!entity) return;
    this.restService.delete(API.main.formbuilder, entity.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Form Deleted Successfully.');
        this.getForms();
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getForms()
  }

  private getHtmlScript(id: string) {
    const { orgId } = this.authService.getUser();
    this.restService
      .get(API.main.formbuilder + `/${orgId}/form/html`, id)
      .subscribe(
        (response: any) => {
          this.htmlContent = response.data;
        },
        (error) => {
          this.notifService.showError(error.error.message);
        },
      );
  }

  private getJsScript(id: string) {
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
    this.scriptContent = script;
    this.showDescription = false;
    this.showHTML = false;
    this.showScript = true;
  }
}
