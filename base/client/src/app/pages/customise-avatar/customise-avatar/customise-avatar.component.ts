import { Component, ViewChild, OnInit, AfterViewInit, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { BotService } from 'src/app/shared/services/bot.service';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ChatBotWidgetsComponent } from 'src/app/widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { defaultAvatarStyle } from 'src/app/common/avatarStyle';

export interface AvatarStyle {
  primaryColor: string;
  textColor: string;
  fontSize: number;
  icon?: string;
}

export enum DeployScriptType {
  FLOATING_BUTTON,
  BOTTOM_BAR,
  FULL_SIZE
}

@Component({
  selector: 'app-customise-avatar',
  templateUrl: './customise-avatar.component.html',
  styleUrls: ['./customise-avatar.component.scss']
})
export class CustomiseAvatarComponent implements OnInit, AfterViewInit {

  defaultBotLogo: string = "";
  selectedImage: File | any = null;
  previewUrl: string | ArrayBuffer | any = null;

  avatarStyle: AvatarStyle;

  wakeupTime = 0; 
  botPosition = "BOTTOM_CENTER";

  canEdit:boolean = false;
  isUpdateing:boolean = false;

  @Input()chatBotWidget! : ChatBotWidgetsComponent;

  @Output()updateIframeUrl = new EventEmitter<any>();

  constructor(
    private avatarService: AvatarService,
    private botService: BotService,
    private restService: RestService,
    private notifService: NotificationService
  ) {
    this.avatarStyle = defaultAvatarStyle;
    this.defaultBotLogo = this.botService.getDefaultBotLogo();
  }

  ngOnInit(): void {
    this.getStyle()
  }

  ngAfterViewInit(): void {
    if(this.chatBotWidget) {
      this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
    }
  }

  toggleEdit()
  {
    this.canEdit = !this.canEdit;
  }

  getStyle() {
    const agentId = this.avatarService.getAvatarId();
    
    if (agentId) {
      this.restService.get(API.main.agent, agentId)
      .subscribe((response: any) => {
          try
          {
            this.avatarStyle = response.styles ? JSON.parse(response.styles) : defaultAvatarStyle; 
            this.avatarStyle.icon = response?.logoUrl;   
            console.log(response);
            
            this.wakeupTime = (response?.wakeupTime / 1000) || 0;   
            this.botPosition = response?.position || "BOTTOM_CENTER";   

          }
          catch(error)
          {
            console.log(error);
            
          }
        }, (error) => {
          console.log(error);
        });
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

  onStyleChange() {
    if(this.chatBotWidget)
    {
      // this.chatBotWidget.updateStyle(this.avatarStyle);
      this.updateIframeUrl.emit();
    }
  }

  onSaveChanges() {
    const styleData = this.avatarStyle;
    delete styleData.icon;
    const styles = JSON.stringify(styleData);
    const agentId = this.avatarService.getAvatarId()
    if (agentId) {
      const wakeupTime = (this.wakeupTime * 1000);
      const position = this.botPosition;
      this.isUpdateing = true;
      this.restService.patch(API.main.agent, agentId + "/styles", { styles, wakeupTime, position})
        .subscribe((response: any) => {
          this.notifService.showSuccess("Avatar style changed");
          this.updateIframeUrl.emit();
          this.isUpdateing = false;
          this.canEdit = false;
        }, (error) => {
          console.log(error);
          this.isUpdateing = false;
          this.notifService.showError(error.error.message);
        });
        if (this.selectedImage) {
          this.onChangeLogoSubmit(agentId);
        }
    }
  }

  onChangeLogoSubmit(botId: string) {
    if (this.selectedImage) {
      const formData = new FormData();
      formData.append('file', this.selectedImage, this.selectedImage.name);
      this.restService.uploadFile(API.main.agent + `/${botId}/logo`, formData)
        .subscribe((response: any) => {
          this.selectedImage = null;
          // this.previewUrl = null;
          // this.chatBotWidget.getAgent(this.avatarService.getAvatarId());
          this.updateIframeUrl.emit();
        }, (error) => {
          console.log(error);
        });
    }
  }

  deplymentType = DeployScriptType;

  getAgentDeploy(type: DeployScriptType) {
    const botId = this.avatarService.getAvatarId();
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const tenantId = url.hostname.split('.')[0]; // Assuming subdomain is the tenant ID

    let script = "";
    if (type === DeployScriptType.BOTTOM_BAR) {
        script = `
        <script type="text/javascript">
            (function() {
                var rootElement = document.createElement("div");
                rootElement.id = "zauto_root";
                document.body.appendChild(rootElement);

                fetch("${API.rootURL}api/agents/widget/${botId}.js", {
                    headers: {
                        'x-tenant-id': '${tenantId}'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.text();
                })
                .then(scriptContent => {
                    var s = document.createElement("script");
                    s.async = 1;
                    s.text = scriptContent;
                    document.getElementsByTagName("head")[0].appendChild(s);
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
            })();
        </script>
        `;
    }

    return script;
}


}
