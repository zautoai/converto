import { PartialType } from '@nestjs/swagger';
import { CreateAgentPromptDto } from './create-agent-prompt.dto';
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAgentPromptDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    templateId?:string;
}
