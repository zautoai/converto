import { Module } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { ExternalCrmController } from './external-crm.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { AssistantsModule } from 'src/assistants/assistants.module';

@Module({
  imports: [MicroservicesModule,AssistantsModule],
  controllers: [ExternalCrmController],
  providers: [ExternalCrmService],
})
export class ExternalCrmModule { }
