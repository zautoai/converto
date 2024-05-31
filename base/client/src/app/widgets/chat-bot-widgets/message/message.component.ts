import { Component, Input } from '@angular/core';
import { ChatMessage } from 'src/app/common/utils/chatHistory';
import { API } from 'src/app/config/endpoint.config';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { RestService } from 'src/app/shared/services/rest.service';

export enum MessageType {
  TEXT = 'TEXT',
  ACTIVITY = 'ACTIVITY',
  ERROR = 'ERROR',
  WARNING = 'WARNING'
}

export enum SentBy {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  LEAD = 'lead'
}

export enum Vote {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {

  GLOBAL_IMAGES = GLOBAL_IMAGES;
  vote = Vote;
  sentBy = SentBy;
  messageType = MessageType;

  @Input() data!: ChatMessage;
  @Input() agent: any = null;

  @Input() animationSpeed = 0;

  @Input() fontSize = 14;
  @Input() textColor = '#ffffff';
  @Input() background = '#9752FC'

  constructor(private restService: RestService) { }

  // vote
  onVoteSumbit(vote: Vote) {
    if (this.data.id) {
      const payload = { vote: vote };
      const endpoint = API.main.conversation + `/message`;
      this.restService.patch(endpoint, this.data.id, payload)
        .subscribe((response: any) => {
          this.data.vote = response?.vote;
        }, (error) => {
          console.log(error);
        });
    }
    else {
      console.error("message id missing.");
    }
  }

  // get message class based on role(sentBy)
  getMessageClass(sentBy: string) {
    if (sentBy == SentBy.USER) {
      return 'end';
    } else if (sentBy == SentBy.ASSISTANT) {
      return 'start';
    } else if (sentBy == SentBy.SYSTEM) {
      return 'center';
    } else {
      return '';
    }
  }

}
