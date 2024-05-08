import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { CrmNames } from "src/common/enums/enums";

export class CRMAuthDto {
    @ApiProperty({required:true, enum: CrmNames})
    @IsEnum(CrmNames)
    name:CrmNames = CrmNames.HUBSPOT;
}