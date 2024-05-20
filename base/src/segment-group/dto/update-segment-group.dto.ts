import { PartialType } from '@nestjs/swagger';
import { CreateSegmentGroupDto } from './create-segment-group.dto';

export class UpdateSegmentGroupDto extends PartialType(CreateSegmentGroupDto) {}
