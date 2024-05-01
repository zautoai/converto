import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class UpdateEventDto {
  @ApiProperty({required: true})
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({required: true})
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({required: true})
  @IsOptional()
  start?: any;

  @ApiProperty({required: true})
  @IsOptional()
  end?: any;

  @ApiProperty({required: true})
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({required: true})
  @IsOptional()
  @IsArray()
  attendees?: any[];
}
