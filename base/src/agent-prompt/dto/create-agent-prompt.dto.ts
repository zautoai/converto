import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAgentPromptDto {

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    agentId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string;
}
