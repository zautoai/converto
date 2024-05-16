import { Module } from '@nestjs/common';
import { SegmentGroupService } from './segment-group.service';
import { SegmentGroupController } from './segment-group.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SegmentGroupController],
  providers: [SegmentGroupService],
})
export class SegmentGroupModule { }
