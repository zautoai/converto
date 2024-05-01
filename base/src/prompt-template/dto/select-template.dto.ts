import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

class Variable {
    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    key:string;

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    value:string;
}

export class SelectTemplateDto {

    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    templateId:string;

    @ApiProperty({ type: [Variable] })
    @ValidateNested({ each: true })
    @Type(() => Variable)
    variables: Variable[];
}
