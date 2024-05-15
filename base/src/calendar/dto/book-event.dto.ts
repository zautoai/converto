import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class BookEventDto {

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    convoId: string;

    @ApiProperty({required: true})
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({required: true})
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    start?: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    end?: string; 
}