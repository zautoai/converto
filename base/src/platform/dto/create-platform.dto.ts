import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";


export class CreatePlatformDto{
    @ApiProperty({ required: false })
    @IsString()
    name: string;
}