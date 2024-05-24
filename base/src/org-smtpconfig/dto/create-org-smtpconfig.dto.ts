import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrgSmtpconfigDto{
    @ApiProperty({ required: true })
    @IsString()
    host: string;

    @ApiProperty({ required: false })
    @IsNumber()
    port: number;

    @ApiProperty({ required: false })
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    user: string;

    @ApiProperty({ required: false })
    @IsString()
    pass: string;
}