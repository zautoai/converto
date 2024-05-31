import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { BullModule } from '@nestjs/bull';
import { AgentModule } from 'src/agent/agent.module';
import { IntentScoreProcessor } from './intent-score.processor';
import { IntentScoringModule } from 'src/intent-scoring/intent-scoring.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'zautoTaskQueue',
    }),
    BullModule.registerQueue({
      name: 'intent_score_queue',
    }),
    IntentScoringModule,
    AgentModule
  ],
  exports: [QueueService, IntentScoreProcessor, QueueProcessor],
  providers: [QueueService, IntentScoreProcessor,QueueProcessor]
})
export class WorkerModule { }
