import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class SelectGreetingDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    url: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    message: string;
}