import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ContactService } from './crm_service/contact.service';
import { SchemaManagerService } from './crm_service/schema-manager.service';
import { FormBuilderMicroService } from './crm_service/form-builder.service';
import { AccountMicroService } from './crm_service/account.service';
import { AccountBasedMarketingMicroService } from './crm_service/account-based-marketing.service';
import { EnrichmentMicroService } from './crm_service/enrichment.service';
import { ExternalCrmMicroService } from './crm_service/external-crm.service';
import { StartupMicroService } from './crm_service/startup.service';
import { SegmentMicroService } from './crm_service/segment.service';
import { SegmentCategoryMicroService } from './crm_service/segment-category.service';
import { IcpMicroService } from './crm_service/icp.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [
    {
      provide: 'CRM_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            host: process.env.REDIS_IP,
            port: +process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
          },
        });
      },
    },
    ContactService,
    SchemaManagerService,
    FormBuilderMicroService,
    AccountMicroService,
    AccountBasedMarketingMicroService,
    EnrichmentMicroService,
    ExternalCrmMicroService,
    SegmentMicroService,
    SegmentCategoryMicroService,
    StartupMicroService,
    IcpMicroService
  ],
  exports: [
    ContactService,
    SchemaManagerService,
    FormBuilderMicroService,
    AccountMicroService,
    AccountBasedMarketingMicroService,
    EnrichmentMicroService,
    ExternalCrmMicroService,
    SegmentMicroService,
    SegmentCategoryMicroService,
    StartupMicroService,
    IcpMicroService
  ],
})
export class MicroservicesModule { }
