import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from '../../config/endpoint.config';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

export class Plugin {
  name: string | undefined;
  key: string | undefined;
  iconUrl: string | undefined;
  description: string | undefined;
  authUrl?: string | null;
  profile?:any | null;
  type?:"CRM" | "CALENDAR";

  constructor(
    name?: string,
    key?: string,
    iconUrl?: string,
    description?: string,
    type?:"CRM" | "CALENDAR"
  ){
    this.name = name;
    this.key = key;
    this.iconUrl = iconUrl;
    this.description = description;
    this.type = type;
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

  private _plugins: Plugin[] = [
    new Plugin(
      'Hubspot',
      'Hubspot',
      'https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/external-hubspot-a-developer-and-marketer-of-software-products-logo-color-tal-revivo.png',
      'Enhance your online operations with seamless integration using the HubSpot plugin',
      "CRM"
    ),
    new Plugin(
      'Google calendar',
      'Google',
      'https://img.icons8.com/color/48/google-calendar--v2.png',
      'Efficiently manage your schedule and tasks with the Google Calendar plugin',
      "CALENDAR"
    )
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

  get plugins(): Plugin[] {
    return this._plugins;
  }

  getAuthUrls() {
    for (let crm of this.plugins) {
      switch (crm.type) {
        case "CRM":
          {
            this.restService.getAll(API.main.external_crm + `/auth-url?name=${crm.key}`)
              .subscribe((data: any) => {
                crm.authUrl = data.url || null;
              },
                (error) => {
                  console.log(error);
                });
            break;
          }
        case "CALENDAR":
          {
            this.restService.getAll(API.main.calendar + `/auth-url?name=${crm.key}`)
            .subscribe((data: any) => {
              crm.authUrl = data.url || null;
            },
            (error) => {
              console.log(error);
            });
            break;
          }
        default:
          break;
      }
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
