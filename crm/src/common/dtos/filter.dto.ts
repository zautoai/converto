import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { toNumber } from '../utils/cast.helper';

export class FilterDto {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchTerm: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Order must be either "asc" or "desc"' })
  sort: 'asc' | 'desc' = 'asc';

  constructor() {
    this.page = this.page || 1;
    this.limit = this.limit || 10;
    this.sort = this.sort || 'asc';
  }
}
