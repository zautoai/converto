import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ required: true, description: 'name of tag' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true, description: 'title of tag' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'description of tag' })
  @IsOptional()
  @IsString()
  description?: string;
}
