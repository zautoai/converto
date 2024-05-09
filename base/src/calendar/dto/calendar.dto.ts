import { ApiProperty } from "@nestjs/swagger";
import { CalendarName } from "../enum/calendar.enum";
import { IsEnum } from "class-validator";

export class CalendarAuthDto {
    @ApiProperty({required:true, enum: CalendarName})
    @IsEnum(CalendarName)
    name:CalendarName = CalendarName.GOOGLE;
}