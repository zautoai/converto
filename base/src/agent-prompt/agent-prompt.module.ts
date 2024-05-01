import { Module } from '@nestjs/common';
import { AgentPromptService } from './agent-prompt.service';
import { AgentPromptController } from './agent-prompt.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LlmModule } from 'src/llm/llm.module';

@Module({
  imports: [PrismaModule,LlmModule],
  controllers: [AgentPromptController],
  providers: [AgentPromptService],
  exports: [AgentPromptService],
})
export class AgentPromptModule {}
