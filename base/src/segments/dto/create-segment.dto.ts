import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSegmentDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    color: string


    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    segmentGroupId: string;
}
