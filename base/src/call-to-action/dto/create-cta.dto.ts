import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CTAType } from "src/common/enums/enums";


export class CreateCTADto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ required: false })
    @IsString()
    link: string;

    @ApiProperty({ required: false })
    @IsEnum(CTAType)
    type: CTAType = CTAType.NAVIGATOR;
}