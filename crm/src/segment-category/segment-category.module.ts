import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SegmentCategoryController } from './segment-category.controller';
import { SegmentCategoryService } from './segment-category.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [SegmentCategoryController],
  providers: [SegmentCategoryService],
})
export class SegmentCategoryModule { }
