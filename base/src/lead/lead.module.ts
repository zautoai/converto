import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentLeadController } from './agent-lead.controller';
import { ConversationModule } from 'src/conversation/conversation.module';
import { CommonModule } from 'src/common/common.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [
    MicroservicesModule,
    PrismaModule, 
    ConversationModule,
    CommonModule
  ],
  controllers: [LeadController, AgentLeadController],
  providers: [LeadService],
  exports: [LeadService]
})
export class LeadModule {}
