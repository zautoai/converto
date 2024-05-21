import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class availableHour {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    start: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    end: string;
}

export class CreateScheduleDto {

    @ApiProperty({ required: true, type: [String] })
    @IsNotEmpty()
    @Transform(({ value }) => value.join(','))
    availableDays: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    eventDuration: number;

    @ApiProperty({ required: true, type: [availableHour] })
    @IsNotEmpty()
    @IsArray()
    availableHours: availableHour[];

    @ApiProperty({ required: false })
    @IsOptional()
    calendarId?: string;

}