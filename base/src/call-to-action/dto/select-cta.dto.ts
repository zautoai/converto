import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CTAType } from "src/common/enums/enums";


export class SelectCTADto{

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    agentId: string;

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    orgId: string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    label: string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    text: string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    link: string;

    @ApiProperty({required:false})
    @IsEnum(CTAType)
    type: CTAType = CTAType.NAVIGATOR;
}