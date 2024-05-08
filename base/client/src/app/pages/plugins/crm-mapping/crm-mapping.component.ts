import { Component, Input, OnInit } from '@angular/core';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';

@Component({
  selector: 'app-crm-mapping',
  templateUrl: './crm-mapping.component.html',
  styleUrl: './crm-mapping.component.scss'
})
export class CrmMappingComponent implements OnInit{

  @Input()crmName:string | undefined;
  contactFields: string[] = [];
  externalCrmFields: any[] = [];

  constructor(
    private readonly restService: RestService
  ) { }

  ngOnInit(): void {
    this.getContactFields();
    this.getExternalCrmField();
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
    this.restService.getAll(API.main.external_crm + `/fields/contacts/${this.crmName}`).subscribe((res:any) => {
      this.externalCrmFields = [...res];      
    },
    err => {
      console.log(err);
    });
  }

  getMappingData() {
    this.restService.getAll('crm-mapping').subscribe(res => {
      console.log(res);
    });
  }

}
