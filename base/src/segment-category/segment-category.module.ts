import { Module } from '@nestjs/common';
import { SegmentCategoryService } from './segment-category.service';
import { SegmentCategoryController } from './segment-category.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [SegmentCategoryController],
  providers: [SegmentCategoryService],
  exports: [SegmentCategoryService]
})
export class SegmentCategoryModule { }
