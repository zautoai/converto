import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { integrationConfigs } from 'src/app/common/constant';
import { IntegrationConfig } from 'src/app/common/intefaces';
import { API } from 'src/app/config/endpoint.config';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';



@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit
{
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  integrationConfigs:IntegrationConfig []= integrationConfigs;

  profiles:any = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private restService: RestService,
    private authService: AuthService,
    private notifiService: NotificationService
  ){}

  ngOnInit(): void {
    
    this.handleIntegrationConfigs()   
  }

  handleIntegrationConfigs() {
    let checkByState = false;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('code') && queryParams.has('state') && !checkByState) {
      const payload = { token: queryParams.get('state') };
      checkByState = true;
      this.restService.post(API.main.oauthStateToken, payload)
      .subscribe(
          (response: any) => {
            const provider = response.provider;
            const endpoint = API.main.oauthCallback.replace('{{provider}}', provider);
            const fullAuthUrl = endpoint + '?' + queryParams.toString();

            if (this.authService.getUser()) {
              this.restService.getAll(fullAuthUrl)
                .subscribe(
                  (response: any) => {
                    this.getProfileFromProviders(provider);
                    this.notifiService.showSuccess(`Successfully connected with ${response.provider}`);
                  },
                  (error) => {
                    console.error('Error while retrieving profile:', error);
                  }
                );
            } else {
              console.warn('User not logged in, cannot retrieve profile');
            }
          },
          (error) => {
            console.error('Error checking state token:', error);
          }
        );

      history.replaceState('', '', window.location.pathname); 
    }
    for (const config of this.integrationConfigs) {
      this.getProfileFromProviders(config.provider);
    }
  }

  getProfileFromProviders(provider: string)
  {
    const endpoint = API.main.oauthProfile.replaceAll('{{provider}}',provider);
    this.restService.getAll(endpoint)
    .subscribe((response:any)=>{
      // console.log(response);
      this.profiles[provider] = response;
    },(error)=>{
      console.log(error);
      // this.notifiService.showError(error.error.message);
    });   

  }

  onConnectClick(provider: string)
  {    
    if(this.authService.getUser())
    {
      this.restService.get(API.main.oauth,provider + `?orgId=${this.authService.getUser().orgId}`)
      .subscribe((response:any)=>{
        location.href = response.redirect_url;
      },(error)=>{
        console.log(error);
      });    
    }
  }

  logOut(provider: string)
  {
    const endpoint = API.main.oauthRevoke.replaceAll('{{provider}}',provider)
    this.restService.getAll(endpoint)
      .subscribe((response:any)=>{
        delete this.profiles[provider]
      },(error)=>{
        console.log(error);
      });  
  }
}
