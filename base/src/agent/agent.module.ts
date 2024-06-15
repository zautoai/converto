import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { AgentPromptModule } from 'src/agent-prompt/agent-prompt.module';
import { AgentChatController } from './agent-chat.controller';
import { ChatService } from './agent-chat.service';
import { LlmModule } from 'src/llm/llm.module';
import { ChromaModule } from 'src/chroma/chroma.module';
import { CommonModule } from 'src/common/common.module';
import { VisitorModule } from 'src/visitor/visitor.module';
import { AvatarCreatorService } from './avatar-creator.service';
import { HelpersModule } from 'src/helpers/helpers.module';
import { BullModule } from '@nestjs/bull';
import { AvatarQueueProcessor } from './worker/avatar-queue.processor';
import { AvatarQueueService } from './worker/avatar-queue.service';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { StageModule } from 'src/stage/stage.module';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { SiteModule } from 'src/site/site.module';
import { DemandGenModule } from 'src/demand-gen/demand-gen.module';
import { TrackingService } from './tracking.service';
import { ContactsModule } from 'src/contacts/contacts.module';

@Module({
  imports: [
    PrismaModule,
    ConversationModule,
    AgentPromptModule,
    ConversationModule,
    LlmModule,
    ChromaModule,
    CommonModule,
    VisitorModule,
    HelpersModule,
    BullModule.registerQueue({
      name: 'AvatarTaskQueue',
    }),
    CommonModule,
    OrganizationsModule,
    StageModule,
    AssistantsModule,
    SiteModule,
    DemandGenModule,
    ContactsModule
  ],
  controllers: [AgentController, AgentChatController],
  providers: [AgentService, ChatService, AvatarCreatorService, AvatarQueueProcessor, AvatarQueueService, TrackingService],
  exports: [AgentService, ChatService, AvatarCreatorService, AvatarQueueProcessor, AvatarQueueService]
})
export class AgentModule { }
