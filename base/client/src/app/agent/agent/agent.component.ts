import { Component,OnInit,ViewChild,AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { BotService } from 'src/app/shared/services/bot.service';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent implements OnInit,AfterViewInit
{

  zauto_bot_url:string = "";
  @ViewChild('iframe', { static: false }) iframe!: ElementRef;

  constructor(
    private formBuilder:FormBuilder,
    private route:ActivatedRoute,
    private restService:RestService,
    public botService:BotService
  ){
 
  }

  ngOnInit(): void 
  {
  }

  ngAfterViewInit(): void
  {
    this.route.paramMap.subscribe((params)=>{
      const botId = params.get('id');
      if(botId)
      {
        this.zauto_bot_url  = API.zauto_bot_url + botId;
        this.updateIframeUrl();
      }
    }); 
  }

  updateIframeUrl(): void {
    if (this.iframe) {
      const iframeElement: HTMLIFrameElement = this.iframe.nativeElement;
      iframeElement.src = this.zauto_bot_url;
    }
  }
}
