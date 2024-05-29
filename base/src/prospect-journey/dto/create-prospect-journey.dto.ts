import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export enum ProspecActivityType {
    CTA_PERFORMED = 'CTA_PERFORMED',
    PAGE_VIEWED = 'PAGE_VIEWED',
    PAGE_CLOSED = 'PAGE_CLOSED',
    LINK_CLICKED = 'LINK_CLICKED',
    CHAT_INITIATED = 'CHAT_INITIATED',
    OTHER = 'OTHER',
}

export class CreateProspectjourneyDto {

    @ApiProperty({description:'id of visitor(session)'})
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    visitId:string;

    @ApiProperty({description:'data of prospect activity data'})
    @IsString()
    @IsOptional()
    data?:string;

    @ApiProperty({description:'type of prospect activity', enum:ProspecActivityType, default:ProspecActivityType.OTHER})
    @IsNotEmpty()
    @IsEnum(ProspecActivityType)
    type:ProspecActivityType = ProspecActivityType.OTHER;

    @ApiProperty({description:'time spend on page', default: 0})
    @IsNotEmpty()
    @IsNumber()
    timeSpend:number = 0;

    @ApiProperty({description:'score of the action', default: 0})
    @IsOptional()
    @IsNumber()
    score:number = 0;

    @ApiProperty({description:'scroll depth', default: 0})
    @IsOptional()
    @IsNumber()
    scrollDepth:number = 0;

    @ApiProperty({description:'scroll depth'})
    @IsNotEmpty()
    @IsString()
    url:string;

    @ApiProperty({description:''})
    @IsOptional()
    @IsString()
    previousPageId?:string;
}
