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
import { EnrichmentProcessor } from './enrichment.processor';
import { EnrichmentMicroserviceController } from './enrichment-provider.micro.controller';

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
  ],
  controllers: [EnrichmentController],
  providers: [
    EnrichmentService,
    EnrichmentProvider,
    ApolloService,
    ClearBitService,
    ZoomInfoService,
    EnrichmentProcessor,
    EnrichmentMicroserviceController
  ],
  exports: [EnrichmentService, ClearBitService, ZoomInfoService],
})
export class EnrichmentModule {}
