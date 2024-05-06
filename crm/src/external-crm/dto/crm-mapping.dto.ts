import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CrmNames } from "../enum/external-crm.enum";

export class CrmMappingDto {

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    objectType:string;

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    fieldName:string;

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    externalCRMObjectType:string;

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    externalCRMFieldName:string;

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    crmName:CrmNames = CrmNames.HUBSPOT;
}