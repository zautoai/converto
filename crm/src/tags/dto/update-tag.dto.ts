import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ required: false, description: 'name of tag' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'title of tag' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'description of tag' })
  @IsOptional()
  @IsString()
  description?: string;
}
