import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from '../../config/endpoint.config';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

export class CRMPlugin {
  name: string | undefined;
  key: string | undefined;
  iconUrl: string | undefined;
  description: string | undefined;
  authUrl?: string | null;
  profile?:any | null;

  constructor(
    name?: string,
    key?: string,
    iconUrl?: string,
    description?: string,
  ){
    this.name = name;
    this.key = key;
    this.iconUrl = iconUrl;
    this.description = description;
  }

  get isConnected(): boolean {
    return this.profile != null;
  }
}

@Component({
  selector: 'app-plugins',
  templateUrl: './plugins.component.html',
  styleUrl: './plugins.component.scss'
})
export class PluginsComponent implements OnInit{

  private _crm: CRMPlugin[] = [
    new CRMPlugin(
      'Hubspot',
      'Hubspot',
      'https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/external-hubspot-a-developer-and-marketer-of-software-products-logo-color-tal-revivo.png',
      'Connect and streamline your online operations with the HubSpot plugin',
    ),
  ];

  @ViewChild('crmMappingOffcanvas',{static:false}) crmMappingOffcanvas: ElementRef | any;
  crmName: string | undefined;

  constructor(
    private readonly restService: RestService,
    private readonly offcanvasService: NgbOffcanvas,
  ) { }

  ngOnInit(): void {
    this.getAuthUrls();
  }

  get crms(): CRMPlugin[] {
    return this._crm;
  }

  getAuthUrls() {
    for (let crm of this.crms) {
      this.restService.getAll(API.main.external_crm + `/auth-url?name=${crm.name}`)
        .subscribe((data:any) => {
          crm.authUrl = data.url || null;
        },
          (error) => {
            console.log(error);
          }
        )
    }
  }

  openCrmMappingOffcanvas(data:any) {
    this.crmName = data.key;
    this.offcanvasService.open(this.crmMappingOffcanvas,{
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible crm_mapping',
      animation: true,

    });
  }

  
}
