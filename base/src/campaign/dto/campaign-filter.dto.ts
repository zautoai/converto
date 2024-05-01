import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, IsNumber, IsString, IsBoolean } from 'class-validator';
import { toBoolean, toNumber, toString } from 'src/common/helpers/cast.helper';


export class CampaignFilterDto {
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

  @Transform(({ value }) => toString(value))
  @IsOptional()
  @IsString()
  searchQ: string;
}