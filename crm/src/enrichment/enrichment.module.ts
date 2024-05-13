import { Module } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import { EnrichmentController } from './enrichment.controller';
import { EnrichmentProvider } from './enrichment.provider';
import { ApolloService } from './providers/apollo.service';
import { CommonModule } from 'src/common/common.module';
import { ClearBitService } from './providers/clearbit.service';
import { ZoomInfoService } from './providers/zoominfo.service';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EnrichmentMicroserviceController } from './enrichment-provider.micro.controller';
import { ExternalCrmModule } from 'src/external-crm/external-crm.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({ name: 'enrichment_queue' }),
    ExternalCrmModule
  ],
  controllers: [EnrichmentController, EnrichmentMicroserviceController],
  providers: [
    EnrichmentService,
    EnrichmentProvider,
    ApolloService,
    ClearBitService,
    ZoomInfoService,
  ],
  exports: [EnrichmentService, ClearBitService, ZoomInfoService],
})
export class EnrichmentModule {}
