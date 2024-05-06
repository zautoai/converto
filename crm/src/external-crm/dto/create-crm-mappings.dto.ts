import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { CrmMappingDto } from "./crm-mapping.dto";

export class CreateCRMMappingsDto {

    @ApiProperty({required:true, type:[CrmMappingDto]})
    @IsArray({message:"Must be an array"})
    mappings:CrmMappingDto[];
}