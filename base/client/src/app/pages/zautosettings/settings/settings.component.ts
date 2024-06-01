import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { BotService } from 'src/app/shared/services/bot.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ChatBotWidgetsComponent } from 'src/app/widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';

export enum DeployScriptType {
  FLOATING_BUTTON,
  BOTTOM_BAR,
  FULL_SIZE
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit, AfterContentInit {

  botId:any;
  agentData: any;
  isChanged: boolean = false;
  canEdit: boolean = false;
  currentSettings: any;

  defaultBotLogo: string;
  selectedImage: File | any = null;
  previewUrl: string | ArrayBuffer | any = null;
  isUpdateing:boolean = false;

  @ViewChild('deleteAgentModal') deleteAgentModal!: ElementRef;
  @ViewChild(ChatBotWidgetsComponent) chatBotWidget!: ChatBotWidgetsComponent;

  zauto_bot_url:string = "";
  @ViewChild('iframe', { static: false }) iframe!: ElementRef;

  constructor(
    private restService: RestService,
    private avatarService: AvatarService,
    private notifService: NotificationService,
    private botService: BotService,
    public modalService: NgbModal,
    private router: Router
  ) {
    this.defaultBotLogo = this.botService.getDefaultBotLogo();
    this.avatarService.avatarEvent$.subscribe((data: any) => {
      this.botId = data?.id;
    });
  }


  ngOnInit(): void {
    this.botId = this.avatarService.getAvatarId();
    if(this.botId)
    {
      this.getAgent();
    }
  }
  
  ngAfterContentInit(): void {
    
  }

  getAgent() {
    this.restService.get(API.main.agent,this.botId + "/primary")
      .subscribe((response: any) => {
        this.agentData = {...response};
        this.currentSettings = {...response};
        this.updateIframeUrl();

      }, (error) => {
        console.log(error);
      });
  }

  onChangeAgentData() {
    const newData = JSON.stringify(this.currentSettings);
    const oldData = JSON.stringify(this.agentData);    
    this.isChanged = (oldData != newData);
  }

  onSubmit() {
    if (this.isChanged) {
      const data = this.currentSettings;
      this.isUpdateing = true;
      this.restService.patch(API.main.agent, this.botId, data)
        .subscribe((response: any) => {
          console.log(response);
          this.notifService.showSuccess("Agent settings updated.");
          this.canEdit = false;
          this.isChanged = false;
          // this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
          this.updateIframeUrl();
          if (this.selectedImage) {
            // this.onChangeLogoSubmit(this.currentSettings.id);
          }
          else {
            this.getAgent();
            this.botService.emitAgentEvent('settings updated');
          }
          this.isUpdateing = false;
        }, (error) => {
          console.log(error);
          this.notifService.showError("Agent settings update failed.");
          this.isUpdateing = false;
        });
    }
  }

  toggleEdit() {
    this.canEdit = !this.canEdit;
    if (!this.canEdit) {
      this.currentSettings = { ...this.agentData };
      this.isChanged = false;
      this.selectedImage = null;
      this.previewUrl = null;
    }
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onChangeLogoSubmit(botId: number) {
    if (this.selectedImage) {
      const formData = new FormData();
      formData.append('file', this.selectedImage, this.selectedImage.name);
      this.restService.uploadFile(API.main.agent + `/${botId}/logo`, formData)
        .subscribe((response: any) => {
          this.selectedImage = null;
          this.previewUrl = null;
          
          this.getAgent();
          this.botService.emitAgentEvent('settings updated');
        }, (error) => {
          console.log(error);
          this.notifService.showError("Agent logo update failed.");
        });
    }
  }

  openDeleteAgentModal() {
    this.modalService.open(this.deleteAgentModal, { centered: true });
  }

  onDeleteAgentSubmit() {
    this.restService.delete(API.main.agent, this.botId)
      .subscribe((response: any) => {
        this.notifService.showSuccess("Agent deleted successfully.");
        this.modalService.dismissAll();
        this.router.navigate(['/auth/login']);
      }, (error) => {
        console.log(error);
      });
  }

  updateIframeUrl(): void {
    this.zauto_bot_url  = API.zauto_bot_url + this.botId;
    console.log(this.zauto_bot_url);
    
    if (this.iframe) {
      const iframeElement: HTMLIFrameElement = this.iframe.nativeElement;
      iframeElement.src = this.zauto_bot_url;
    }
  }

  deplymentType = DeployScriptType;

  getAgentDeploy(type: DeployScriptType) {

    let script = "";
    if (type == DeployScriptType.BOTTOM_BAR) {
      script = `
      <script type="text/javascript">
        (function()
        {
            var rootElement = document.createElement("div");
            rootElement.id = "zauto_root";
            document.body.appendChild(rootElement);
            d = document; 
            s = d.createElement("script");     
            s.async = 1;     
            s.src = "${API.rootURL}api/agents/widget/${this.botId}.js";
            d.getElementsByTagName("head")[0].appendChild(s);
        })();
      </script>
      `
    }
    else if (type == DeployScriptType.FULL_SIZE) { 
      script = `<iframe src="${API.zauto_bot_url+this.botId}" width="100%" height="100%" scrolling="no" seamless="seamless" frameborder="0"></iframe>`
    }

    return script;
  }
}



