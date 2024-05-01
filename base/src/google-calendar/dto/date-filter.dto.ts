import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";


export class DateFilterDto{

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    @IsDateString()
    date:string;

}