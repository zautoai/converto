import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ExternalToolLevel, ToolType } from "src/common/enums/enums";


export class CreateToolDto{

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    authUrl: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    tokenUrl: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    profileUrl: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    propertyUrl: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    clientId: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    clientSecret: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    redirectUri: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    scope: string;

    @ApiProperty({required: true, enum: ExternalToolLevel})
    @IsNotEmpty()
    @IsString()
    @IsEnum(ExternalToolLevel)
    level: ExternalToolLevel;

    @ApiProperty({required: true, enum: ToolType})
    @IsNotEmpty()
    @IsString()
    @IsEnum(ToolType)
    type: ToolType;
}