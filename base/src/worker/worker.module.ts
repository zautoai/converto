import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { BullModule } from '@nestjs/bull';
import { AgentModule } from 'src/agent/agent.module';
import { IntentScoreProcessor } from './intent-score.processor';
import { IntentScoringModule } from 'src/intent-scoring/intent-scoring.module';
import { IcpModule } from 'src/icp/icp.module';
import { IcpScoreProcessor } from './icp-score.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'zautoTaskQueue',
    }),
    BullModule.registerQueue({
      name: 'intent_score_queue',
    }),
    BullModule.registerQueue({
      name:'icp_score_queue'
    }),
    IntentScoringModule,
    IcpModule,
    AgentModule
  ],
  exports: [QueueService, IntentScoreProcessor, QueueProcessor,IcpScoreProcessor],
  providers: [QueueService, IntentScoreProcessor,QueueProcessor,IcpScoreProcessor]
})
export class WorkerModule { }
