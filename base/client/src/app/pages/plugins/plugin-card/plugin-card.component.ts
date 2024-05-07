import { Component, Input, OnInit } from '@angular/core';
import { CRMPlugin } from '../plugins.component';
import { RestService } from 'src/app/shared/services/rest.service';
import { ActivatedRoute } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';

@Component({
  selector: 'app-plugin-card',
  templateUrl: './plugin-card.component.html',
  styleUrl: './plugin-card.component.scss'
})
export class PluginCardComponent implements OnInit{


  @Input() data:CRMPlugin = new CRMPlugin();
  isLoading:boolean = false;

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((_params:any) => {
      if(Object.keys(_params).length > 0)
      {
        this.callBack(_params.code, _params.state);
      }
    });
  }

  connect() {
    if(this.data.authUrl)
    {
      window.location.href = this.data.authUrl;
    }
  }

  private callBack(code: string, state: any) {
    this.isLoading = true;
    this.restService.getAll(API.main.external_crm + `/callback?code=${code}&state=${state}`)
      .subscribe((data: any) => {
        if (data.statusCode === 200) {
          this.data.isConnected = true;
          this.isLoading = false;
        }
        else {
          this.data.isConnected = false;
          this.isLoading = false;
        }
      }, (error) => {
        console.log(error);
        this.data.isConnected = true;
        this.isLoading = false;
      });
  }

  private getProfile()
  {
    this.restService.getAll(API.main.external_crm + `/profile`)
      .subscribe((data:any) => {
        
      },
        (error) => {
          console.log(error);
        }
      )
  }
}
