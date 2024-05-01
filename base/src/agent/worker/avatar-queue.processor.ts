// queue.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { AvatarCreatorService } from '../avatar-creator.service';

@Processor('AvatarTaskQueue')
@Injectable()
export class AvatarQueueProcessor {

  constructor(private avatarCreatorService: AvatarCreatorService) {}

  @Process({name: 'launchAvatar', concurrency: 5})
  async processTask(job: Job<any>): Promise<void> {
    const taskData = job.data;
    try {
        console.log(`Processing task started: ${JSON.stringify(taskData)}`);
        const result = await this.avatarCreatorService.createAvatar(taskData.id, taskData.dto, taskData.org);
        console.log(`Processing task completed: ${JSON.stringify(result)}`);
    } catch(error) {
        console.log(error)
    }
  }
}
