import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSchemaManagerDto {
  @ApiProperty({ required: true, description: 'id of organization' })
  @IsNotEmpty()
  @IsString()
  orgId: string;

  @ApiProperty({ required: true, description: 'name of organization' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
