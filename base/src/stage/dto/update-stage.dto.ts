import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class UpdateStageDto{

    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    instruction?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    sequence?: number;
}