import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-footer',
  templateUrl: './chat-footer.component.html',
  styleUrls: ['./chat-footer.component.scss']
})
export class ChatFooterComponent implements OnInit{

  messageInput:string = '';
  humanSupportRequested: boolean = false;
  handoverRequested: boolean = false;

  @Input() show:boolean = false;
  @Input() disable:boolean = false;
  @Input() convData:any = null;

  lead: any = {
    name: undefined,
    email: undefined,
  };

  @Output() onSendMessage:EventEmitter<string> = new EventEmitter();
  @Output() onSendHandoverRequest:EventEmitter<any> = new EventEmitter();

  @ViewChild('messageInputField',{static:false}) messageInputField!: ElementRef;

  @Input() fontSize = 14;
  @Input() textColor = '#ffffff';
  @Input() background = '#9752FC'

  ngOnInit(): void {
    if (this.convData?.lead) {
      this.lead.name = this.convData.lead.name;
      this.lead.email = this.convData.lead.email;
    }
  }

  sendMessageEvent(event?: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if(keyboardEvent) keyboardEvent.preventDefault();
    if (keyboardEvent && keyboardEvent.key !== 'Enter') {
      return;
    }
    const messageToSend = this.messageInput.trim();
    if (messageToSend) {
      this.onSendMessage.emit(messageToSend);
      this.messageInput = '';
    }
  }

  requestHumanSupport()
  {
    if (this.convData.lead) {
      this.sendRequest(this.convData.lead)
    } else {
      this.humanSupportRequested = !this.humanSupportRequested;
    }
  }

  confirmSend()
  {
    if (this.lead && this.lead.name && this.lead.email) {
      this.humanSupportRequested = false;
      this.sendRequest(this.lead);
    }
  }

  sendRequest(lead: any)
  {
    if (lead.name && lead.email) {
      this.handoverRequested = true;
      console.log('Emitted event requestHumanSupport');
      this.onSendHandoverRequest.emit(lead);
      setTimeout(() => {
        if (!this.convData.aiSuspended) {
          this.humanSupportRequested = false;
          this.handoverRequested = false;
        }
      }, 30000)
    }
  }

  resetHumanRequest()
  {
    this.humanSupportRequested = false;
    this.handoverRequested = false;
  }

  newLine(event: Event): void {
    event.preventDefault();
    this.messageInput += '\n';
  }

  public setFocus()
  {
    
    setTimeout(() => {
    if (this.messageInputField) {
        this.messageInputField.nativeElement.focus();
      }
    }, 1);
  }
  
}
