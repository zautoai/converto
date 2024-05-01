import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentConversationController } from './agent-conversation.controller';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [PrismaModule, AssistantsModule,AccountModule],
  controllers: [ConversationController, AgentConversationController],
  providers: [ConversationService],
  exports: [ConversationService]
})
export class ConversationModule {}
