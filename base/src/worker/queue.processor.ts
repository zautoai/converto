// queue.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';

@Processor('zautoTaskQueue')
@Injectable()
export class QueueProcessor {
  @Process('launchAvatar')
  async processTask(job: Job<any>): Promise<void> {
    const taskData = job.data;
    try {
        console.log(`Processing task started: ${JSON.stringify(taskData)}`);
        console.log(taskData, taskData.taskFn)
        await taskData.taskFn();
        console.log(`Processing task completed: ${JSON.stringify(taskData)}`);
    } catch(error) {
        console.log(error)
    }
  }
}
