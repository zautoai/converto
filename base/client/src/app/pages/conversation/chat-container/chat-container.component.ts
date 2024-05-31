import { Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { API } from 'src/app/config/endpoint.config';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { WebsocketService, SocketEventEnum } from 'src/app/shared/services/websocket.service';
import { Vote } from 'src/app/widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { Observable } from 'rxjs';
import { ChatHistory } from 'src/app/common/utils/chatHistory';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss']
})
export class ChatContainerComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;

  convoData: any = null;
  isconvoDataLoading: boolean = false;
  vote = Vote;

  chatHistroy:ChatHistory = new ChatHistory();

  // message input field
  messageInput: string = "";

  // sokect events
  private messageEvent!: Subscription;
  private susbendAiEvent!: Subscription;
  private resumeAiEvent!: Subscription;
  private customerRequestEvent!: Subscription;

  // connection
  connectionInprogress: boolean = false;

  // chat body
  @ViewChild('chatBody', { static: false }) chatBodyRef!: ElementRef;

  @Output() onGetConversation: EventEmitter<any> = new EventEmitter();

  constructor(
    private socketService: WebsocketService,
    private restService: RestService,
    private renderer: Renderer2,
    public alertService: SweetAlertService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {

  }

  ngOnInit(): void {
    const convId = this.route.snapshot.params['id'];
    this.registerSokectEvents();
  }

  // register socket events
  registerSokectEvents() {

    // on ai suspended
    if (this.susbendAiEvent) this.susbendAiEvent.unsubscribe();
    this.susbendAiEvent = this.socketService.registerCustomEvent("aiSuspended", SocketEventEnum.AISUSPENDED)
      .subscribe((data: any) => {
        if (data.event == SocketEventEnum.AISUSPENDED) {
          this.loadMessagesFromConvo(data?.id );
        }
      });

    // on ai resume
    if (this.resumeAiEvent) this.resumeAiEvent.unsubscribe();
    this.resumeAiEvent = this.socketService.registerCustomEvent("resumeAIAgent", SocketEventEnum.RESUMEAIAGENT)
      .subscribe((data: any) => {
        if (data.event == SocketEventEnum.RESUMEAIAGENT) {
          this.loadMessagesFromConvo(data?.id);
        }
      });

    // on ai resume
    if (this.customerRequestEvent) this.customerRequestEvent.unsubscribe();
    this.customerRequestEvent = this.socketService.registerCustomEvent("customerRequest", SocketEventEnum.CUSTOMERREQUEST)
      .subscribe((data: any) => {
        if (data.event == SocketEventEnum.CUSTOMERREQUEST) {
          console.log(data);

        }
      });
  }

  getSelectedConvo(convId: string) {
    if (convId) {
      this.loadMessagesFromConvo(convId);
      if (this.messageEvent) this.messageEvent.unsubscribe();
      this.messageEvent = this.socketService.registerCustomEvent(convId + "_messages", SocketEventEnum.MESSAGE)
        .subscribe((data: any) => {
          if (data.event == SocketEventEnum.MESSAGE) {
            if (this.convoData?.id == data?.message?.convId) {
            // this.convoData?.messages.push(data?.message);
            this.chatHistroy.addMessage(data?.message);
              this.scrollToBottom();
            }
          }
        });
    }
  }

  // lead chat history by api call
  loadMessagesFromConvo(convId: string) {
    if (convId) {
      this.isconvoDataLoading = true;
      this.chatHistroy.clearChatHistory();
      this.restService.get(API.main.conversation, convId)
        .subscribe((response: any) => {
          this.convoData = response;
          this.chatHistroy.addMessages(response?.messages);          
          this.scrollToBottom();
          this.connectionInprogress = false
          this.isconvoDataLoading = false;
          this.onGetConversation.emit(response);
        }, (error) => {
          console.log(error);
          this.isconvoDataLoading = false;
        });
    }
  }

  // send message by enter
  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();

    if (keyboardEvent.keyCode === 13) {
      this.sendMsg()

    }
  }

  // send method for button click
  
  sendMsg() {
    const content = this.messageInput || "";
    if (content.length > 0) {
      const message = this.messageInput;
      this.onSendMsg(message);
    }
  }

  // send throu socket
  onSendMsg(message: string) {
    this.scrollToBottom();

    if (this.convoData.id) {
      const payload = {
        convId: this.convoData.id,
        content: message
      }
      this.socketService.emitEvent("messageByHuman", payload);
      this.messageInput = "";
    }

  }

  // start chat
  startChat() {
    this.alertService.info('Start Chat', 'Start chatting will suspend AI response.',
      ['confirm', 'cancel'], (confirmation) => {
        console.log(confirmation)
        if (confirmation.isConfirmed) {
          this.suspendAI();
          this.connectionInprogress = true;
        }
      });
  }

  // start chat
  endChat() {
    this.alertService.info('End Chat', 'Ending chat will Resume AI response.',
      ['confirm', 'cancel'], (confirmation) => {
        console.log(confirmation)
        if (confirmation.isConfirmed) {
          this.resumeAI()
          this.connectionInprogress = true;
        }
      });
  }

  // suspend ai
  suspendAI() {
    if (this.convoData) {
      const payload = { convId: this.convoData.id };
      this.socketService.emitEvent('suspendAI', payload);
      this.loadMessagesFromConvo(this.convoData?.id);
    }
  }

  // resume ai
  resumeAI() {
    if (this.convoData) {
      const payload = { convId: this.convoData.id };
      this.socketService.emitEvent('resumeAI', payload);
      this.loadMessagesFromConvo(this.convoData?.id);
    }
  }

  // check for assignee
  checkAssignee(assigneeId: string) {
    return assigneeId == this.authService.getUser()?.id;
  }

  // sort history
  sortHistory(data: any) {
    const sortedArray = data.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
    return [...sortedArray];
  }

  // scroll down chat body
  scrollToBottom() {
    setTimeout(() => {
      if (this.chatBodyRef) {
        const chatBody = this.chatBodyRef.nativeElement;
        this.renderer.setProperty(chatBody, 'scrollTop', chatBody.scrollHeight);
      }
    }, 0);
  }
}
