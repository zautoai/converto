import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateKeyMappingDto{

    @IsOptional()
    @IsString()
    orgId: string;

    @IsOptional()
    @IsString()
    orgToolId: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    fieldName:string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    externalFieldName:string;
}