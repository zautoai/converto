import { Injectable } from '@angular/core';
import {Socket,io} from 'socket.io-client'
import { API } from 'src/app/config/endpoint.config';
import { BotService } from './bot.service';

@Injectable({
  providedIn: 'root'
})
export class ChatGatewayService {

  public socket!:Socket;
  convoId:number|undefined = undefined

  constructor(private botService: BotService) 
  {
    // this.socket = io(API.rootURL);
  }

  connectSocket()
  {
    this.socket = io(API.rootURL, {
      query: {
        visitId: this.botService.getVisit()
      }
    });
    // this.registerEvent();
  }

  registerEvent()
  {
    this.socket.on('convCreated',(data)=>{
      console.log('convo Connected: ',data);
      this.convoId = data.id;
    });
    this.socket.on('convCreateFailed',(data)=>{
      console.log('conv connection Failed: ',data);
    });
    this.socket.on('replyMessage',(data)=>{
      console.log('replyMessage: ',data);
    });
    this.socket.on('messageFailed',(data)=>{
      console.log('replyMessage: ',data);
    });
  }

  createConvo(agentId:number,welcomeMsg:string)
  {
    if(agentId)
    {
      const payload = {
        agentId: agentId,
        chatMessage: {
          messages: [
            {
              role: 'assistant',
              content: welcomeMsg
            }
          ]
        }
      }
      this.socket.emit('createConversation',{agentId:agentId});
    }
  }

  sendMessage(agentId:number,convoId:number,message:string)
  {
    if(agentId && convoId)
    {
      const payload = {
        agentId: agentId,
        convId: convoId,
        chatMessage: {
          messages: [
            {
              role: 'user',
              content: message
            }
          ]
        }
      }
      this.socket.emit('message',payload);
    }
  }

  getConvoId()
  {
    return this.convoId
  }
}
