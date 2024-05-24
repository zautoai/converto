import { PartialType } from '@nestjs/swagger';
import { CreateSchemaManagerDto } from './create-schema-manager.dto';

export class UpdateSchemaManagerDto extends PartialType(
  CreateSchemaManagerDto,
) {}
