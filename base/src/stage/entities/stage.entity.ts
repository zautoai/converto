import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class Stage{

    @ApiProperty()
    @IsNumber()
    agentId: number;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;
}