import { Module } from '@nestjs/common';
import { IcpScoreService } from './icp-score.service';
import { IcpScoreController } from './icp-score.controller';
import { BullModule } from '@nestjs/bull';
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({ name: 'icp_score_queue' }),
    MicroservicesModule],
  controllers: [IcpScoreController],
  providers: [IcpScoreService],
})
export class IcpScoreModule { }
