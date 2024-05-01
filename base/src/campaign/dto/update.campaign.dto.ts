import { ApiProperty } from "@nestjs/swagger";

import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { CampaignStatus } from "src/common/enums/enums";

export class UpdateCampaignDto{

    @ApiProperty({required:true})
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({required:true})
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    url?: string;

    @ApiProperty({required:false})
    @IsEnum(CampaignStatus)
    @IsOptional()
    status?: CampaignStatus = CampaignStatus.ACTIVE;

    @ApiProperty({required:false})
    @IsNumber()
    @IsOptional()
    startDateTimestamp?: number;
    
    
    @ApiProperty({required:false})
    @IsNumber()
    @IsOptional()
    endDateTimestamp?: number;

    @ApiProperty({required:false})
    @IsBoolean()
    isZauto: boolean = true;

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    idParam: string;

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    idValue: string;

}