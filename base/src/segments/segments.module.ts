import { Module } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [SegmentsController],
  providers: [SegmentsService],
  exports: [SegmentsService]
})
export class SegmentsModule { }
