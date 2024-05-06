import { Module } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import { EnrichmentController } from './enrichment.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [EnrichmentController],
  providers: [EnrichmentService],
})
export class EnrichmentModule {}
