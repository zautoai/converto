import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateStageDto{

    @ApiProperty()
    @IsString()
    @IsOptional()
    agentId: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    orgId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    instruction: string;

    @ApiProperty()
    @IsNumber()
    sequence: number;
}