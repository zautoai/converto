import { PartialType } from '@nestjs/swagger';
import { CreateIntentScoringDto } from './create-intent-scoring.dto';

export class UpdateIntentScoringDto extends PartialType(CreateIntentScoringDto) {}
