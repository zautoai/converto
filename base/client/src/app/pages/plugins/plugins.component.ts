import { Component } from '@angular/core';

export class CRMPlugin {
  name: string | undefined;
  iconUrl: string | undefined;
  description: string | undefined;
  isConnected?:boolean = false;
} 

@Component({
  selector: 'app-plugins',
  templateUrl: './plugins.component.html',
  styleUrl: './plugins.component.scss'
})
export class PluginsComponent {

  constructor() { }

  get crms():CRMPlugin[]{
    return [
      {
        name: 'Hubspot',
        iconUrl: 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/external-hubspot-a-developer-and-marketer-of-software-products-logo-color-tal-revivo.png',
        description: 'Connect and streamline your online operations with the HubSpot plugin',
      }
    ]
  }

}
