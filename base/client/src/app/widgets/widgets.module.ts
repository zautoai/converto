import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WidgetsRoutingModule } from './widgets-routing.module';

import { ChatBotWidgetsComponent } from './chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { ChatHeaderComponent } from './chat-bot-widgets/chat-header/chat-header.component';
import { ChatFooterComponent } from './chat-bot-widgets/chat-footer/chat-footer.component';
import { LeadFormComponent } from './chat-bot-widgets/lead-form/lead-form.component';
import { TypingIndicatorComponent } from './chat-bot-widgets/typing-indicator/typing-indicator.component';
import { ChatTimePipe } from './pipes/chat-time.pipe';
import { MessageComponent } from './chat-bot-widgets/message/message.component';
import { MarkdownDirective } from './directives/markdown.directive';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    ChatBotWidgetsComponent,
    ChatHeaderComponent,
    ChatFooterComponent,
    LeadFormComponent,
    TypingIndicatorComponent,
    MessageComponent,
    ChatTimePipe,
    MarkdownDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    WidgetsRoutingModule,
    NgxSkeletonLoaderModule,
  ],
  exports:[
    ChatBotWidgetsComponent,
    ChatHeaderComponent,
    ChatFooterComponent,
    LeadFormComponent,
    TypingIndicatorComponent,
    MessageComponent,
  ]
})
export class WidgetsModule { }
