import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CrmNames } from "src/common/enums/enums";

export class HubspotCallBackDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty({ required: true, enum: CrmNames })
    @IsEnum(CrmNames)
    state: CrmNames;
}