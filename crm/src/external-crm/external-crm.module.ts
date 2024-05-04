import { Module } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { ExternalCrmController } from './external-crm.controller';
import { ExternalCrmProvider } from './external-crm.provider';
import { HubspotService } from './providers/hubspot.service';
import { CommonModule } from 'src/common/common.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[
    CommonModule,
    HttpModule
  ],
  controllers: [ExternalCrmController],
  providers: [
    ExternalCrmService, 
    ExternalCrmProvider,
    HubspotService
  ],
})
export class ExternalCrmModule {}
