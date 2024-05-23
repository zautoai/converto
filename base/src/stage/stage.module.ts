import { Module } from '@nestjs/common';
import { AgentPromptModule } from 'src/agent-prompt/agent-prompt.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StageController } from './stage.controller';
import { StageService } from './stage.service';

@Module({
  imports: [PrismaModule, AgentPromptModule],
  providers: [StageService],
  controllers: [StageController],
  exports: [StageService]
})
export class StageModule { }
