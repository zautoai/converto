import { Component, Input, Output , EventEmitter,ViewChild,ElementRef,AfterViewInit} from '@angular/core';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';
import { MessageType, SentBy } from '../message/message.component';

export class LeadData {
  type: string;
  title: string;
  fieldName: string;
  value: string;

  constructor() {
    this.type = "";
    this.title = "";
    this.fieldName = "";
    this.value = "";
  }
}

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.scss']
})
export class LeadFormComponent implements AfterViewInit{

  sentBy = SentBy;
  messageType = MessageType;
  isSubmiting:boolean = false;

  @Input() leadData: LeadData;
  @Input() convId: any = undefined;
  @Input() avatar: any = null;
  @Input() data:any;

  @Input() fontSize = 14;
  @Input() textColor = '#ffffff';
  @Input() background = '#9752FC'

  @Output() onLeadSubmitEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('inputField', { static: false }) inputField: ElementRef | undefined;

  constructor(private restService: RestService) {
    this.leadData = new LeadData();
  }

  ngAfterViewInit(): void {
    if (this.inputField && this.inputField.nativeElement) {
      this.inputField.nativeElement.focus();
    }
  }

  // submit lead
  onLeadSubmit() {
    if (this.convId) {
      if (!this.avatar.id) {
        console.error("Missing avatar ID");
        return;
      }      
      if(this.leadData.fieldName.length > 0 && this.leadData.value.length > 0)
      {
        let payload:any = { convId: this.convId };
        if(this.leadData.type == 'info')
        {
          const jsonData: any = {};
          jsonData[this.leadData.fieldName] = this.leadData.value;
          payload[this.leadData.type] = JSON.stringify(jsonData);
        }
        else
        {
          payload[this.leadData.type] = this.leadData.value;
        }
  
        const endpoint = API.main.leadAgent.replace(':agentId', this.avatar.id);
        this.isSubmiting = true;
        this.restService.post(endpoint, payload)
          .subscribe((response: any) => {
            const message = this.maskSensitiveInfo(`${this.leadData.title} is ${this.leadData.value}`);
            this.onLeadSubmitEvent.emit(message);
            this.isSubmiting = false;
          }, (error) => {
            console.error(error);
            this.isSubmiting = false;
          });
      }
      else
      {
        console.error("Field name or value missing");
      }
    }
    else {
      console.error("Missing data or convId");
    }
  }

  // mask email and mobile number
  maskSensitiveInfo(inputString: string) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const phoneRegex = /(\d{3})\d{3}(\d{4})/g;

    const emailSuffix = inputString.split("@")[1];
    const maskedEmails = inputString.replace(emailRegex, `XXXX@${emailSuffix}`);
    const maskedPhoneNumbers = maskedEmails.replace(phoneRegex, "$1XXX$2");

    return maskedPhoneNumbers;
  }

}
