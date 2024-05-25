import { PartialType } from '@nestjs/mapped-types';
import { CreateProspectJurnyDto } from './create-prospect-jurny.dto';

export class UpdateProspectJurnyDto extends PartialType(CreateProspectJurnyDto) {}
