import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

enum FieldType {
    TEXT = 'TEXT',
    EMAIL = 'EMAIL',
    TEXTAREA = 'TEXTAREA',
    NUMBER = 'NUMBER',
}

class CreateLeadField {
    @ApiProperty({ required: true, description: 'Label of the Field' })
    @IsNotEmpty()
    @IsString()
    label: string;

    @ApiProperty({
        required: false,
        description: 'Type of the Field',
        enum: FieldType,
    })
    type: FieldType = FieldType.TEXT;

    @ApiProperty({
        required: true,
        description: 'Contact Field Name of the Field',
    })
    @IsNotEmpty()
    @IsString()
    contactField: string;

    @ApiProperty({ required: false, description: 'Is Required of the Field' })
    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;
}

export class CreateFormBuilderDto {
    @ApiProperty({ required: true, description: 'Title of the Form' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ required: false, description: 'Description of the Form' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false, description: 'Status of the Form' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        required: false,
        description: 'Fields of the Form',
        type: [CreateLeadField],
    })
    @IsOptional()
    createLeadField?: CreateLeadField[];
}
