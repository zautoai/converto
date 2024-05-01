import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateExternalApiKeyMappingDto {

    orgId: string;
    apiId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    fieldName: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    externalFieldName: string;
}