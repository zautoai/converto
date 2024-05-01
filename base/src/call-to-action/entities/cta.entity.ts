import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CallToAction{
    @ApiProperty({required:true})
    @IsOptional()
    @IsString()
    agentId: string;

    @ApiProperty({required:true})
    @IsString()
    orgId: string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    link: string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;
}