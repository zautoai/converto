import { PartialType } from '@nestjs/mapped-types';
import { CreateProspectjourneyDto } from './create-prospect-journey.dto';

export class UpdateProspectjourneyDto extends PartialType(CreateProspectjourneyDto) {}
