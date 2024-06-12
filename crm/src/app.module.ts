import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SchemaManagerModule } from './schema-manager/schema-manager.module';
import { StartupModule } from './startup/startup.module';
import { TagsModule } from './tags/tags.module';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { CommonModule } from './common/common.module';
import { ContactsModule } from './contacts/contacts.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { RedisModule } from './redis/redis.module';
import { FormBuilderModule } from './form-builder/form-builder.module';
import { AccountsModule } from './accounts/accounts.module';
import { AccountBasedMarketingModule } from './account-based-marketing/account-based-marketing.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MicroservicesModule } from './microservices/microservices.module';
import { ExternalCrmModule } from './external-crm/external-crm.module';
import { SegmentsModule } from './segments/segments.module';
import { SegmentCategoryModule } from './segment-category/segment-category.module';
import { IcpModule } from './icp/icp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.prod.env' : '.env',
    }),
    BullBoardModule.forRoot({
      route: '/bull-board',
      adapter: ExpressAdapter,
    }),
    CommonModule,
    PrismaModule,
    StartupModule,
    SchemaManagerModule,
    TagsModule,
    EnrichmentModule,
    ContactsModule,
    RedisModule,
    FormBuilderModule,
    AccountsModule,
    AccountBasedMarketingModule,
    CustomFieldsModule,
    MicroservicesModule,
    ExternalCrmModule,
    SegmentsModule,
    SegmentCategoryModule,
    IcpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
