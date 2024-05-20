import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { CampaignStatus } from "src/common/enums/enums";

export class CreateCampaignDto{

    @ApiProperty({required:true})
    @IsString()
    title: string;

    @ApiProperty({required:true})
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    url?: string;

    @ApiProperty({required:false, default:CampaignStatus.ACTIVE})
    @IsEnum(CampaignStatus)
    @IsOptional()
    status?: CampaignStatus = CampaignStatus.ACTIVE;

    @ApiProperty({required:false})
    @IsDate()
    @IsOptional()
    endDate?: Date;

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