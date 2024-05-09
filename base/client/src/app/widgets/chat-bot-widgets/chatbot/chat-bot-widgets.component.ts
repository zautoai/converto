import { Component, OnInit, Renderer2, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { BotService } from 'src/app/shared/services/bot.service';
import { Socket, io } from 'socket.io-client';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { LeadData } from '../lead-form/lead-form.component';
import { ChatHistory } from 'src/app/common/utils/chatHistory';
import { MessageType, SentBy } from '../message/message.component';
import { ChatFooterComponent } from '../chat-footer/chat-footer.component';
import { defaultAvatarStyle } from 'src/app/common/avatarStyle';

export enum Vote {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}


@Component({
  selector: 'app-chat-bot-widgets',
  templateUrl: './chat-bot-widgets.component.html',
  styleUrls: ['./chat-bot-widgets.component.scss']
})
export class ChatBotWidgetsComponent implements OnInit, AfterViewInit, OnDestroy {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  chatHistory: ChatHistory;
  agent: any;
  convData: any;
  @Input() showCloseBtn:boolean = false;
  @Input() agentId: any = undefined;
  showChat: boolean = false;
  isTyping: boolean = false;
  visitSource: string | null = null;
  queryParams: string | null = null;
  isConvoStarted: boolean = false;
  vote = Vote;

  leadData: LeadData = new LeadData();

  isChatLoading: boolean = false;
  lastMessage: any = null;

  public socket!: Socket;
  convId: any = undefined;


  @Input() forTest: boolean = false;
  @Input() defaultAvatarStyle: any = defaultAvatarStyle;

  @Output() closeAgentEvent = new EventEmitter<boolean>();

  @ViewChild('chatBody', { static: false }) chatBodyRef!: ElementRef;

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef;

  @ViewChild(ChatFooterComponent) ChatFooterComponent!: ChatFooterComponent;

  constructor(
    private route: ActivatedRoute,
    private restService: RestService,
    private botService: BotService,
    private renderer: Renderer2,
  ) {
    this.chatHistory = new ChatHistory();
  }

  ngOnInit(): void {
    console.log('Chatbot Added')
    window.addEventListener('beforeunload', this.cleanup.bind(this));
    this.route.queryParamMap.subscribe((querys) => {

      if (!this.forTest) {
        this.visitSource = querys.get('source');
        const homeReferrer = querys.get('homeSource');

        if (this.visitSource && this.visitSource != 'null') {
          localStorage.setItem("referrer", this.visitSource);
        }
        else {
          const referrer = localStorage.getItem("referrer") || homeReferrer || 'site';
          this.visitSource = referrer;
        }

        const currentParams = { ...this.route.snapshot.queryParams };
        currentParams['source'] = this.visitSource;
        delete currentParams['homeSource'];
        const queryString = Object.keys(currentParams)
          .filter(key => currentParams[key] !== null && currentParams[key] !== undefined)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(currentParams[key])}`)
          .join('&');
        this.queryParams = queryString;


      } else {
        this.botService.setTestMode();
      }
    });

  }
  ngAfterViewInit(): void {
    if (this.agentId) {
      this.getAgent(this.agentId);
    }
  }

  connectSocket() {
    this.socket = io(API.rootURL, {
      query: {
        visitId: this.botService.getVisit()
      }
    });
    this.registerEvent();
  }

  getAgent(agentId: any) {
    this.agentId = agentId;

    if (this.agentId) {
      let endpoint = API.main.agent;
      let queryParam = `?${this.queryParams}`;
      if (this.botService.getVisitor()) queryParam += `&visitor=${this.botService.getVisitor()}`;
      this.restService.get(endpoint, this.agentId + queryParam)
        .subscribe((response: any) => {
          this.agent = response;
          if (this.agent) {
            const visitorId = response.visitor.id;
            const visitId = response.visit.id;
            this.botService.setVisitor(visitorId);
            this.botService.setVisit(visitId);
            // this.convId = response.visitor.conversation.id;  

          }
        }, (error) => {
          console.log(error);
        });
    }
  }

  registerEvent() {
    //create convo
    this.socket.on('convCreated', (data) => {
      this.onCreateConvo(data)
    });
    this.socket.on('convCreateFailed', (data) => {
      console.log('conv connection Failed: ', data);
      this.isTyping = false;
    });

    //message
    this.socket.on('replyMessage', (data) => {
      this.onReciveMsg(data);
    });
    this.socket.on('messageFailed', (data) => {
      console.log('replyMessage: ', data);
      this.isTyping = false;
    });

    //lead
    this.socket.on('leadfound', (data) => {
      this.onLeadFund(data);
    });

    this.socket.on('aiSuspended', (socketMessage) => {
      this.convData.aiSuspended = true;
      if(this.ChatFooterComponent)
      {
        this.ChatFooterComponent.resetHumanRequest();
      }
    });

    this.socket.on('resumeAIAgent', (socketMessage) => {
      this.convData.aiSuspended = false;
      if(this.ChatFooterComponent)
      {
        this.ChatFooterComponent.resetHumanRequest();
      }
    });
  }

  getChatHistory() {
    if (this.convId) {
      this.isChatLoading = true;
      let endpoint = API.main.agentChat.replace(':agentId', this.agentId);
      endpoint = endpoint.replace(':convId', this.convId);

      this.restService.getAll(endpoint)
        .subscribe((response: any) => {
          // set history
          const chatHistory = this.sortHistory(response);
          this.chatHistory.addMessages(chatHistory);

          this.scrollToBottom();
          this.isChatLoading = false;
        }, (error) => {
          this.isChatLoading = false;
          console.log(error);
          this.createConvo(this.agentId, this.agent.welcomeMsg);
          const message = { role: 'assistant', content: this.agent.welcomeMsg, createdAt: new Date() };
          this.chatHistory.addMessage(message);
        });

    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatBody = this.chatBodyRef.nativeElement;
      this.renderer.setProperty(chatBody, 'scrollTop', chatBody.scrollHeight);
    }, 0);
  }

  onCreateConvo(data: any) {
    this.convId = data.id;
    this.convData = data;
    this.botService.setVisitor(data.visitorId);
    this.botService.setVisit(data.visitId);
    this.getChatHistory();
  }

  // receive message from socket
  onReciveMsg(data: any) {
    console.log(data);
    this.chatHistory.addMessage(data.message);
    this.isTyping = false;
    this.scrollToBottom();
    this.lastMessage = data.message;
    this.playMessageReceivedSound();
    if (this.ChatFooterComponent) {
      this.ChatFooterComponent.setFocus();
    }
  }

  // send message through socket and add in history
  onSendMsg(message: string) {
    this.scrollToBottom();

    if (!this.agentId) {
      console.error("Avater Id missing");
      return;
    }

    if (!this.convId) {
      console.error("Convo Id missing");
      return;
    }

    const payload = {
      agentId: this.agentId,
      convId: this.convId,
      chatMessage: {
        messages: [
          {
            role: SentBy.USER,
            content: message
          }
        ]
      }
    };
    // send on sokect event
    this.socket.emit('message', payload);

    // add in chat history
    const _message = { role: SentBy.USER, type: MessageType.TEXT, content: message, createdAt: new Date() }
    this.chatHistory.addMessage(_message);

    this.isTyping = true
  }

  // create conversation
  createConvo(agentId: any, welcomeMsg: string) {
    if (agentId) {
      const payload = {
        agentId: agentId,
        visitorId: this.botService.getVisitor(),
        visitId: this.botService.getVisit(),
        chatMessage: {
          messages: [
            {
              role: 'assistant',
              content: welcomeMsg
            }
          ]
        }
      }
      this.socket.emit('createConversation', payload);
      if (this.ChatFooterComponent) {
        this.ChatFooterComponent.setFocus();
      }
    }
  }

  // lead found trigger
  onLeadFund(data: any) {
    console.log(data);
    if (data.content.lead) {
      this.leadData.type = data.content.type;
      this.leadData.title = data.content.title;
      this.leadData.fieldName = this.formateFieldName(data.content.title);
      if (this.isOtherLead(this.leadData.type)) {
        this.leadData.type = "info";
      }

      // remove old lead from from history
      this.chatHistory.deleteLeadFromChat();

      // push new lead form
      const message = { role: SentBy.LEAD, type: this.leadData.type, filedName: this.leadData.title };
      this.chatHistory.addMessage(message);

      this.scrollToBottom();
    }
  }

  // check if the lead is common or other
  isOtherLead(text: string): boolean {
    const keywords = ['email', 'mobile', 'name', 'whatsapp', 'phone'];
    const lowerCaseText = text.toLowerCase();
    if (keywords.includes(lowerCaseText)) {
      return false;
    }
    return true;
  }

  // submit lead
  onLeadSubmit(message: string) {
    this.chatHistory.deleteLeadFromChat();
    this.leadData = new LeadData();
    this.onSendMsg(message);
    this.scrollToBottom();
  }

  formateFieldName(filedName: string) {
    return filedName.toLocaleLowerCase().replace(' ', '_');
  }

  startChat() {
    this.connectSocket();
    this.createConvo(this.agentId, this.agent.welcomeMsg);
    this.isConvoStarted = true;
  }

  sortHistory(data: any) {
    const sortedArray = data.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
    return [...sortedArray];
  }

  voteMsg(chat: any, vote: Vote) {
    if (chat.id) {
      const data = { vote: vote };
      const endpoint = API.main.conversation + `/message`;
      this.restService.patch(endpoint, chat.id, data)
        .subscribe((response: any) => {
        }, (error) => {
          console.log(error);
        });
    }
  }

  playMessageReceivedSound() {
    const audioPlayer: HTMLAudioElement = this.audioPlayerRef.nativeElement;
    audioPlayer.play();
  }

  closeAgent() {
    this.closeAgentEvent.emit(false);
    window.parent.postMessage({ openChat: false }, '*');
  }

  private cleanup(): void {
    try {
      this.socket.off('convCreated');
      this.socket.off('convCreateFailed');
      this.socket.off('replyMessage');
      this.socket.off('messageFailed');
      this.socket.off('message');
      this.socket.disconnect();
    }
    catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }


  updateStyle(style: any) {
    if (this.agent.styles) {
      this.agent.styles = JSON.stringify(style);
    }
    else {
      this.defaultAvatarStyle = style;
    }
  }

  getAvatarStyle() {
    return this.agent.styles ? JSON.parse(this.agent?.styles) : this.defaultAvatarStyle;
  }

  getWelcomeGradient() {
    return `linear-gradient(to bottom, ${this.getAvatarStyle()?.primaryColor} 20%, transparent 100%)`
  }

  // send human handover
  sendHandoverRequest(lead: any) {
    this.socket.emit('requestHumanSupport', { convId: this.convId, lead });
  }
}
