import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { DateFilter } from "src/common/enums/enums";


export class DashbaordDto{

    @ApiProperty()
    @IsOptional()
    widget?: string[] | string;

    @ApiProperty({type:DateFilter})
    @IsEnum(DateFilter)
    @IsOptional()
    dateFilter?:DateFilter = DateFilter.THIS_MONTH;

    @ApiProperty()
    @IsString()
    @IsOptional()
    startDate?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    endDate?: string;
}