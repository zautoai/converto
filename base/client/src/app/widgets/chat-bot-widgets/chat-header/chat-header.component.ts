import { Component, Input } from '@angular/core';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';

@Component({
  selector: 'app-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent 
{
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  @Input() avatar:any = null;
  @Input() showCloseBtn:boolean = true;
  @Input() fontSize = 14;
  @Input() textColor = '#ffffff';
  @Input() background = '#9752FC'

  onClose()
  {
    window.parent.postMessage({ openChat: false }, '*');
  }
}
