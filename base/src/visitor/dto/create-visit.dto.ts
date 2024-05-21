import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class CreateVisitDto {

    @ApiProperty()
    @IsString()
    visitorId: string;


    @ApiProperty()
    @IsString()
    @IsOptional()
    campaignId?: string = null;

    @ApiProperty()
    @IsString()
    source: string;

}