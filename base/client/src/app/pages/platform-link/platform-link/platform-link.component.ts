import { Component,OnInit } from '@angular/core';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { ActivatedRoute } from '@angular/router';
import { AvatarService } from 'src/app/shared/services/avatar.service';

interface link{
  name:string;
  url:string;
}

@Component({
  selector: 'app-platform-link',
  templateUrl: './platform-link.component.html',
  styleUrls: ['./platform-link.component.scss']
})
export class PlatformLinkComponent implements OnInit
{
  agentId:any = undefined;
  linkList:link[] =[];
  platforms:any = [];
  constructor(
    private restService:RestService,
    private platformService:PlatformService,
    private route:ActivatedRoute,
    private avatarService:AvatarService
  ){}

  ngOnInit(): void {

    this.agentId = this.avatarService.getAvatarId(); 
    this.restService.getAll(API.main.orgPlatform)
    .subscribe((response:any)=>{
      this.platforms = response.data;
      this.generateLinks();
    },(error)=>{
      console.log(error);
    });
  }

  generateLinks()
  {
    if(this.platforms.length > 0)
    {
      this.platforms.forEach((orgPlatform:any) => {
        const platformName = orgPlatform.platform.name;  
        let url = API.platformUrl;
        url = url.replace('&campaign={{selectedCampaign}}','');
        url = url.replace('{{agentId}}',this.agentId);
        url = url.replace('{{platformName}}',platformName);
        const link:link = {name:platformName,url:url};
        this.linkList.push(link);          
      });
    }
  }

  getPlatformIcon(name:string)
  {
    let platform = this.platformService.defaultPlatforms.find(platform => platform.name === name);
    if(!platform)
    {
      platform = this.platformService.otherPlatform;
    }
    return platform;
  }
}
