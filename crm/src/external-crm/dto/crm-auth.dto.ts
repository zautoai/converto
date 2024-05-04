import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { CrmNames } from "../enum/external-crm.enum";

export class CRMAuthDto {
    @ApiProperty({required:true, enum: CrmNames})
    @IsEnum(CrmNames)
    name:CrmNames;
}