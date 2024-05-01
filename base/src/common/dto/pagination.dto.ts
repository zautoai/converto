import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, IsNumber } from 'class-validator';
import { toNumber } from '../helpers/cast.helper';

export class PaginationDto {
  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page: number = 1;

  @Transform(({ value }) => toNumber(value, { default: 5, min: 1 }))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit: number = 10;
} 