import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class CreateSessionDto {

    @ApiProperty({required:false})
    @IsString()
    @IsOptional()
    visitorId?: string;

    @ApiProperty({required:false})
    @IsString()
    @IsOptional()
    campaignId?: string = null;
    
    @ApiProperty({required:false})
    @IsString()
    @IsOptional()
    source?: string;

}