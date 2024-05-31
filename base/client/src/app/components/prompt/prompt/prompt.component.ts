import { Component,OnInit } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NavService } from 'src/app/shared/services/nav.service';

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss']
})
export class PromptComponent implements OnInit
{
  botId:any = undefined;
  promptText:string = "";

  constructor(
    private navService:NavService,
    private restService:RestService,
  ){}

  ngOnInit(): void 
  {
    this.botId = this.navService.getAgentIdFromUrl()
    if(this.botId)
    {
      this.getPrompt();
    }
  }
  getPrompt()
  {
    this.restService.get(API.main.agentPrompt,this.botId)
    .subscribe((response:any)=>{
      this.promptText = response.text;
    },(error)=>{
      console.log(error);
    });
  }
}
