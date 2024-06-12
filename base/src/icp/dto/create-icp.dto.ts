import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateIcpDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({ required: true })
    @IsInt()
    @IsNotEmpty()
    score: number

    @ApiProperty({ required: true })
    @IsArray()
    @IsNotEmpty()
    segmentIds: string[]
}
