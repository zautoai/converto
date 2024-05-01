// queue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AvatarQueueService {
  constructor(@InjectQueue('AvatarTaskQueue') private readonly queue: Queue) {}

  async addTaskToQueue(data: any): Promise<void> {
    await this.queue.add(data.name, data);
  }
}
