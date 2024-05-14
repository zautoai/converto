import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ExternalCrmProcessor } from './processors/external-crm.processor';
import { BullModule } from '@nestjs/bull';
import { ContactsModule } from 'src/contacts/contacts.module';
import { ExternalCrmModule } from 'src/external-crm/external-crm.module';
import { EnrichmentProcessor } from './processors/enrichment.processor';
import { EnrichmentModule } from 'src/enrichment/enrichment.module';
import { AccountsModule } from 'src/accounts/accounts.module';

@Module({
  imports: [
    ContactsModule,
    ExternalCrmModule,
    EnrichmentModule,
    AccountsModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
  ],
  providers: [
    RedisService,
    EnrichmentProcessor,
    ExternalCrmProcessor
  ],
  exports: [RedisService],
})
export class RedisModule {}
