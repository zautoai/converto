import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export enum IntentType {
    POSITIVE = 'POSITIVE',
    NEGATIVE = 'NEGATIVE'
}

export class CreateIntentScoringDto {

    @ApiProperty({description: 'Name of the intent scoring',example: 'intent_scoring_1'})
    @IsString()
    @IsNotEmpty()
    name:string;

    @ApiProperty({description: 'Description of the intent scoring', example: 'Intent Scoring 1'})
    @IsString()
    @IsOptional()
    description?:string;

    @ApiProperty({description: 'Type of the intent scoring', enum:IntentType, default:IntentType.POSITIVE,example: 'POSITIVE'})
    @IsNotEmpty()
    @IsString()
    type:IntentType;

    @ApiProperty({description: 'Value of the intent scoring', example: '0'})
    @IsNotEmpty()
    @IsNumber()
    @Min(-100)
    @Max(100)
    value:number = 0;
}
