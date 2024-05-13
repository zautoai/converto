import { Module } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { ExternalCrmController } from './external-crm.controller';
import { ExternalCrmProvider } from './external-crm.provider';
import { HubspotService } from './providers/hubspot.service';
import { CommonModule } from 'src/common/common.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MappingService } from './mapping.service';
import { ExternalCrmMicroserviceController } from './external-crm.micro.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports:[
    CommonModule,
    HttpModule,
    PrismaModule,

  ],
  controllers: [ExternalCrmController, ExternalCrmMicroserviceController],
  providers: [
    ExternalCrmService, 
    ExternalCrmProvider,
    HubspotService,
    MappingService
  ],
  exports: [ExternalCrmService],
})
export class ExternalCrmModule {}
