import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class UpdateExternalApiKeyMappingDto {

    orgId: string;
    apiEndpointId: string;

    @ApiProperty({ required: true })
    @IsOptional()
    @IsString()
    fieldName?: string;

    @ApiProperty({ required: true })
    @IsOptional()
    @IsString()
    externalFieldName?: string;
}