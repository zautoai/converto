import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit, OnChanges{

  @Input()campaignId:string | null = null;

  countsData:any = null;

  constructor(
    private restService: RestService,
  ){}

  ngOnInit(): void {
    if(this.campaignId)
    {
      this.getCounts();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {    
    if(changes["campaignId"].currentValue !== changes["campaignId"].previousValue)
    {
      if(this.campaignId)
      {
        this.getCounts();
      }
    }
    
  }



  getCounts()
  {
    this.restService.get(API.main.campaign,this.campaignId + "/counts")
    .subscribe((response:any)=>{
      this.countsData = response;
    },(error)=>{
      console.log(error);
    });
  }

  getIcons(name: any)
  {
    let icon = "";
    if(name === "leads")
    {
      icon = "user";
    }
    else if(name === "visits")
    {
      icon = "eye";
    }
    else if(name === "conversations")
    {
      icon = "message-circle";
    }
    else
    {
      icon = "alert-circle";
    }
    return icon;
  }

}
