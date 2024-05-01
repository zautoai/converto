import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrgPlatformDto{
    @ApiProperty({ required: true })
    @IsString()
    @IsOptional()
    platformId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    orgId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;
}