import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";
import { toLowerCase, trim } from '../../common/helpers/cast.helper'

export class SourceQuery {

    @ApiProperty()
    @Transform(({ value }) => toLowerCase(value))
    @IsOptional()
    source: string;

    @ApiProperty()
    @Transform(({ value }) => trim(value))
    @IsOptional()
    campaign: string;

    @ApiProperty()
    @Transform(({ value }) => trim(value))
    @IsOptional()
    visitor: string;
}