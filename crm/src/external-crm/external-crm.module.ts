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
import { ExternalCrmProcessor } from './external-crm.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports:[
    CommonModule,
    HttpModule,
    PrismaModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({ name: 'crm_queue' }),
  ],
  controllers: [ExternalCrmController, ExternalCrmMicroserviceController],
  providers: [
    ExternalCrmService, 
    ExternalCrmProvider,
    HubspotService,
    MappingService,
    ExternalCrmProcessor
  ],
  exports: [ExternalCrmService],
})
export class ExternalCrmModule {}
