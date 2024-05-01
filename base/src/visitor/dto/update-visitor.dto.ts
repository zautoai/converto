import { ApiProperty, PartialType } from '@nestjs/swagger';

import { IsEnum, IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class UpdateVisitorDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  agentId: string;

  @ApiProperty()
  @IsString()
  userAgent: string;

  @ApiProperty()
  @IsString()
  source: string;

  @ApiProperty()
  @IsNumber()
  count: number = 1;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  infoJson: string;
}
