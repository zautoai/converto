import { Component,AfterViewInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatBotWidgetsComponent } from 'src/app/widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';

@Component({
  selector: 'app-embedder',
  templateUrl: './embedder.component.html',
  styleUrls: ['./embedder.component.scss']
})
export class EmbedderComponent implements AfterViewInit
{

  @ViewChild(ChatBotWidgetsComponent) chatBotWidget! : ChatBotWidgetsComponent;

  constructor(private route:ActivatedRoute) {}

  ngAfterViewInit(): void {

    this.route.paramMap.subscribe((params)=>{
      const botId = params.get('id');
      if(botId)
      {
        this.chatBotWidget.getAgent(botId);
      }
    }); 
  }
}
