import { Component,OnInit } from '@angular/core';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-platforms',
  templateUrl: './platforms.component.html',
  styleUrls: ['./platforms.component.scss']
})
export class PlatformsComponent implements OnInit
{

  orgPlatformList:any;
  platformInput:string = "";
  isLoading:boolean = false;

  constructor(
    private platfromService:PlatformService,
    private restService:RestService,
    private notifService:NotificationService
  ){}

  ngOnInit(): void {
    this.getOrgPlatforms();
  }

  getOrgPlatforms()
  {
    this.restService.getAll(API.main.orgPlatform)
    .subscribe((response:any)=>{
      this.orgPlatformList = response;
    },(error)=>{
      console.log(error);
    });
  }

  getPlatformIcon(name:string)
  {
    let platform = this.platfromService.defaultPlatforms.find(platform => platform.name === name);
    if(!platform)
    {
      platform = this.platfromService.otherPlatform;
    }
    return platform;
  }

  addPlatform()
  {
    if(this.platformInput.length > 0)
    {
      this.isLoading = true;
      this.restService.post(API.main.orgPlatform+"-other",{name:this.platformInput})
      .subscribe((resonse:any)=>{
        this.getOrgPlatforms();
        this.platformInput = "";
        this.notifService.showSuccess("New platform added");
        this.isLoading = false;
      },(error)=>{
        console.log(error);
        this.notifService.showError(error.error.message);
        this.isLoading = false;
      });
    }
  }

  removePlatform(id:string)
  {
    if(id)
    {
      this.isLoading = true;
      this.restService.delete(API.main.orgPlatform,id)
      .subscribe((response:any)=>{
        this.getOrgPlatforms();
        this.notifService.showSuccess("platform deleted");
        this.isLoading = false;
      },(error)=>{
        console.log(error);
        this.notifService.showError(error.error.message);
        this.isLoading = false;
      });
    }
  }

}
