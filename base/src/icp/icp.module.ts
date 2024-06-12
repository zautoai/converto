import { Module } from '@nestjs/common';
import { IcpService } from './icp.service';
import { IcpController } from './icp.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { AssistantsModule } from 'src/assistants/assistants.module';

@Module({
  imports: [MicroservicesModule, AssistantsModule],
  controllers: [IcpController],
  providers: [IcpService],
  exports: [IcpService]
})
export class IcpModule { }
