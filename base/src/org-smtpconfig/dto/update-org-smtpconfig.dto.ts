import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateOrgSmtpconfigDto{
    @ApiProperty({ required: true })
    @IsOptional()
    @IsString()
    host?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    port?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    user?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    pass?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}