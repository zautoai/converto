import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SegmentCategoryController } from './segment-category.controller';
import { SegmentCategoryService } from './segment-category.service';
import { CommonModule } from 'src/common/common.module';
import { SegmentCategoryMicroController } from './segment-category.micro.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [SegmentCategoryController, SegmentCategoryMicroController],
  providers: [SegmentCategoryService],
})
export class SegmentCategoryModule { }
