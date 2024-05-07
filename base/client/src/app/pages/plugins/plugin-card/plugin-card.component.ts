import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CRMPlugin } from '../plugins.component';
import { RestService } from 'src/app/shared/services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';

@Component({
  selector: 'app-plugin-card',
  templateUrl: './plugin-card.component.html',
  styleUrl: './plugin-card.component.scss'
})
export class PluginCardComponent implements OnInit{


  @Input() data:CRMPlugin = new CRMPlugin();
  isLoading:boolean = false;

  @Output() mappingOpen = new EventEmitter<any>();

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((_params:any) => {
      if(Object.keys(_params).length > 0)
      {
        this.callBack(_params.code, _params.state);
      }
      else
      {
        this.getProfile();
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
          this.getProfile();
          this.isLoading = false;
        }
        else {
          this.isLoading = false;
        }
        this.router.navigate([], {
          queryParams: [],
        });
      }, (error) => {
        console.log(error);
        this.isLoading = false;
      });
  }
    
    private getProfile() {
      this.isLoading = true;
      this.restService.getAll(API.main.external_crm + `/profile?${this.data.key}`)
      .subscribe((data: any) => {
        this.isLoading = false;
        this.data.profile = data;
      },
      (error) => {
          this.isLoading = false;
          console.log(error);
        }
      )
  }

  revoke()
  {
    alert("Revoke");
  }

  openMapping() {
    this.mappingOpen.emit(this.data);
  }
}
