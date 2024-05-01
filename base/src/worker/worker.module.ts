import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { BullModule } from '@nestjs/bull';
import { AgentModule } from 'src/agent/agent.module';

@Module({
  imports: [BullModule.registerQueue({
    name: 'zautoTaskQueue',
  }), AgentModule],
  exports: [QueueService, QueueProcessor],
  providers: [QueueService, QueueProcessor]
})
export class WorkerModule {}
