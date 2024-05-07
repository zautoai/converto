import { Module } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { ExternalCrmController } from './external-crm.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [ExternalCrmController],
  providers: [ExternalCrmService],
})
export class ExternalCrmModule { }
