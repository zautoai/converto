import { Component, OnInit } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from '../../config/endpoint.config';

export class CRMPlugin {
  name: string | undefined;
  iconUrl: string | undefined;
  description: string | undefined;
  authUrl?: string | null;
  isConnected?: boolean = false;
}

@Component({
  selector: 'app-plugins',
  templateUrl: './plugins.component.html',
  styleUrl: './plugins.component.scss'
})
export class PluginsComponent implements OnInit{

  private _crm: CRMPlugin[] = [
    {
      name: 'Hubspot',
      iconUrl: 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/external-hubspot-a-developer-and-marketer-of-software-products-logo-color-tal-revivo.png',
      description: 'Connect and streamline your online operations with the HubSpot plugin',
    }
  ];

  constructor(
    private readonly restService: RestService
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
}
