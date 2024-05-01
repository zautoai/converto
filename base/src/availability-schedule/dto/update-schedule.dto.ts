import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class availableHour {
    @ApiProperty({required: true})
    @IsOptional()
    @IsString()
    start: string;

    @ApiProperty({required: true})
    @IsOptional()
    @IsString()
    end: string;
}

export class UpdateScheduleDto {

    orgId:string;

    @ApiProperty({required: true, type:[String]})
    @IsOptional()
    @Transform(({ value }) => value.join(','))
    availableDays: string;

    @ApiProperty({required: true})
    @IsOptional()
    @IsNumber()
    eventDuration: number;

    @ApiProperty({required: true,type:[availableHour]})
    @IsOptional()
    @IsArray()
    availableHours: availableHour[];

    @ApiProperty({required: false})
    @IsOptional()
    calendarId?: string;
}