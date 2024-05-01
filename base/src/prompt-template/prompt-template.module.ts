import { Module } from '@nestjs/common';
import { PromptTemplateService } from './prompt-template.service';
import { PromptTemplateController } from './prompt-template.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentPromptModule } from 'src/agent-prompt/agent-prompt.module';

@Module({
  imports:[
    PrismaModule,
    AgentPromptModule
  ],
  controllers: [PromptTemplateController],
  providers: [PromptTemplateService],
})
export class PromptTemplateModule {}
