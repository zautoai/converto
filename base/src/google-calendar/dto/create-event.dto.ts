import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class CreateEventDto {
  @ApiProperty({required: true})
  @IsNotEmpty()
  @IsString()
  convoId: string;

  @ApiProperty({required: true})
  @IsNotEmpty()
  @IsString()
  summary: string;

  @ApiProperty({required: true})
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({required: true})
  @IsNotEmpty()
  start: any;

  @ApiProperty({required: true})
  @IsNotEmpty()
  end: any;

  @ApiProperty({required: true})
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({required: true})
  @IsOptional()
  @IsArray()
  attendees?: any[];
}
