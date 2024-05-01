import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";


export class CreateLeadCategoryDto{

    @ApiProperty({ required: false })
    @IsString()
    title: string;

    @ApiProperty({ required: false })
    @IsString()
    description: string;

    @ApiProperty({ required: false })
    @IsString()
    color: string;

}