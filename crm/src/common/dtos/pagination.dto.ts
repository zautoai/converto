import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, IsOptional } from 'class-validator';
import { toNumber } from '../utils/cast.helper';

export class PaginationDto {
  @ApiProperty({ required: false })
  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Page must be a positive integer' })
  page: number = 1;

  @ApiProperty({ required: false })
  @Transform(({ value }) => toNumber(value, { default: 5, min: 1 }))
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Page size must be a positive integer' })
  limit: number = 10;

  constructor() {
    this.page = this.page || 1;
    this.limit = this.limit || 5;
  }
}
