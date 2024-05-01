import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { StageController } from './stage.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentStageController } from './agent-stage.controller';
import { AgentModule } from 'src/agent/agent.module';
import { AgentPromptModule } from 'src/agent-prompt/agent-prompt.module';

@Module({
  imports:[PrismaModule,AgentPromptModule],
  providers: [StageService],
  controllers: [StageController, AgentStageController],
  exports:[StageService]
})
export class StageModule {}
