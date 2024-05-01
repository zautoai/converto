import { Component,ElementRef, ViewChild,OnInit,AfterViewInit } from '@angular/core';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { RestService } from '../../services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { BotService } from '../../services/bot.service';
import { ChatBotWidgetsComponent } from '../../../widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit,AfterViewInit 
{

  @ViewChild('chatContainer') chatContainer:ElementRef | undefined;
  @ViewChild(ChatBotWidgetsComponent) chatBotWidget!:ChatBotWidgetsComponent;


  chatElement:any;
  agent:any;
  botId:any = undefined;
  convId:any = undefined;
  chatForm:FormGroup;
  showChat:boolean = false;
  isBuffering:boolean = false;

  defaultBotLogo:string;

  constructor(
    private formBuilder:FormBuilder,
    private route:ActivatedRoute,
    private navService:NavService,
    private restService:RestService,
    private botService:BotService,
  ){
    this.chatForm = this.formBuilder.group({
      message:['',Validators.required],
    });
    this.defaultBotLogo = this.botService.getDefaultBotLogo();
    this.botId = this.navService.getAgentIdFromUrl();
    if(this.botId)
    {
      this.getAgent();
      
    }
    this.botService.event$.subscribe(data=>{
      this.getAgent();
      this.chatBotWidget.getAgent(this.botId);
    });
  }

  ngOnInit(): void {    
    
    
  }
  
  ngAfterViewInit(): void {
    if(this.botId)
    {
      this.chatBotWidget.getAgent(this.botId);
    }
  }
  
  getAgent()
  {
    this.restService.get(API.main.agent,this.botId)
    .subscribe((response:any)=>{
      this.agent = response;
      if(this.agent)
      {
      }
    },(error)=>{
      console.log(error);
    });
  }

  closeAgent(event:any)
  {
    this.toggleChat();
  }

  toggleChat()
  {
    this.showChat = !this.showChat;
  }

}
