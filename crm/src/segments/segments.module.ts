import { Module } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { SegmentMicroController } from './segment.micro.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [SegmentsController, SegmentMicroController],
  providers: [SegmentsService],
})
export class SegmentsModule { }
