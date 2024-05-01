import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsPositive } from "class-validator";
import { toBoolean, toDateFromTimestamp, toNumber, toString, toUpperCase } from "src/common/helpers/cast.helper";


export class ConversationFilterDto {

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

  @IsOptional()
  @Transform(({ value }) => toString(value))
  campaign: string;

  @IsOptional()
  @Transform(({ value }) => toDateFromTimestamp(value))
  modifiedAt: Date;

  @IsOptional()
  @Transform(({ value }) => toDateFromTimestamp(value))
  fromDate: Date;

  @IsOptional()
  @Transform(({ value }) => toDateFromTimestamp(value))
  toDate: Date;

  @IsOptional()
  @Transform(({ value }) => toUpperCase(value))
  status: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  lead: boolean;


}