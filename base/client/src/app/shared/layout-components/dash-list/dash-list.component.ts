import { Component, Input } from '@angular/core';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-dash-list',
  templateUrl: './dash-list.component.html',
  styleUrls: ['./dash-list.component.scss']
})
export class DashListComponent 
{
  @Input() title:string = "List title";
  @Input() icon:string = "eye";
  @Input() listData:any = [];
  @Input() showLoader:boolean = false;

  constructor(private platfromService:PlatformService){}

  getPlatformIcon(name:string)
  {
    let platform = this.platfromService.defaultPlatforms.find(platform => platform.name === name);
    if(!platform)
    {
      platform = this.platfromService.otherPlatform;
    }
    return platform;
  }
}
