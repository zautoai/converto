import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
@Component({
  selector: 'app-crm-contact-mapping',
  templateUrl: './crm-contact-mapping.component.html',
  styleUrl: './crm-contact-mapping.component.scss'
})
export class CrmContactMappingComponent implements OnInit{

  isLoading:boolean = false;
  @Input()crmName:string | undefined;
  contactFields: string[] = [];
  externalCrmFields: any[] = [];

  selectedOptions: { [key: string]: string } = {};

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();

  constructor(
    private readonly restService: RestService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.getContactFields();
    this.getExternalCrmField();
    this.getMappingData();
  }

  getContactFields()
  {
    this.restService.getAll(API.main.contact + '/fields').subscribe((res:any) => {
      this.contactFields = res.data;
    },
    err => {
      console.log(err);
    }
  );
  }

  getExternalCrmField()
  {
    if(!this.crmName) return;    
    this.isLoading = true;
    this.restService.getAll(API.main.external_crm + `/fields/${this.crmName}/Contact`).subscribe((res:any) => {
      this.externalCrmFields = [...res];      
      this.isLoading = false;
    },
    err => {
      console.log(err);
      this.isLoading = false;
    });
  }

  getMappingData() {
    this.restService.getAll(API.main.external_crm + `/mappings/${this.crmName as string}/Contact`).subscribe((res:any) => {
      this.handleMapping( res || []);
    });
  }

  private handleMapping(data:any[])
  {
    for (const item of data) {
      this.selectedOptions[item.fieldName] = item.externalCRMFieldName;
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  submit() {
    if(!this.crmName) return;
    const fields = Object.keys(this.selectedOptions);
    if(fields.length === 0) return;
    const mappings = [];
    for (const field of fields) {
      mappings.push({
        objectType:'Contact',
        fieldName: field,
        externalCRMObjectType: 'Contact',
        externalCRMFieldName: this.selectedOptions[field],
        crmName: this.crmName
      });
    }   
    this.isLoading = true;
    this.restService.post(API.main.external_crm + `/mappings`, {mappings}).subscribe(res => {
      console.log(res);
      this.onSubmit.emit();
      this.notificationService.showSuccess('Mapping saved successfully');
      this.isLoading = false;
    },
    err => {
      this.isLoading = false;
      console.log(err);
      }
    );
  }

}
