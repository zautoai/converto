import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CTAType } from "src/common/enums/enums";


export class UpdateCTADto {

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    link?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(CTAType)
    type?: CTAType = CTAType.NAVIGATOR;

}