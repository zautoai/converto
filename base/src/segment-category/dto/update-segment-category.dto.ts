import { PartialType } from '@nestjs/swagger';
import { CreateSegmentCategoryDto } from './create-segment-category.dto';

export class UpdateSegmentCategoryDto extends PartialType(CreateSegmentCategoryDto) {}
