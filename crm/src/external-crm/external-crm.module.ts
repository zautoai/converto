import { Module } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { ExternalCrmController } from './external-crm.controller';
import { ExternalCrmProvider } from './external-crm.provider';
import { HubspotService } from './providers/hubspot.service';
import { CommonModule } from 'src/common/common.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MappingService } from './mapping.service';

@Module({
  imports:[
    CommonModule,
    HttpModule,
    PrismaModule
  ],
  controllers: [ExternalCrmController],
  providers: [
    ExternalCrmService, 
    ExternalCrmProvider,
    HubspotService,
    MappingService
  ],
})
export class ExternalCrmModule {}
