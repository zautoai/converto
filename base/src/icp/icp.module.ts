import { Module } from '@nestjs/common';
import { IcpService } from './icp.service';
import { IcpController } from './icp.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MicroservicesModule,
    AssistantsModule,
    BullModule.registerQueue({
      name: 'icp_score_queue'
    }),
  ],
  controllers: [IcpController],
  providers: [IcpService],
  exports: [IcpService]
})
export class IcpModule { }
