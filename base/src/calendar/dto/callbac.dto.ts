import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CalendarName } from "../enum/calendar.enum";

export class CallBackDto {
    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    code:string;

    @ApiProperty({required:true, enum: CalendarName})
    @IsEnum(CalendarName)
    state:CalendarName;
}