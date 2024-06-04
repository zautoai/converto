import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum FieldType {
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
}

export class UpdateLeadField {
  @ApiProperty({ required: true, description: 'Label of the Field' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({
    required: false,
    description: 'Type of the Field',
    enum: FieldType,
  })
  @IsOptional()
  type?: FieldType;

  @ApiProperty({
    required: false,
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

export class UpdateFormBuilderDto {
  @ApiProperty({ required: false, description: 'Title of the Form' })
  @IsOptional()
  @IsString()
  title?: string;

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
    type: [UpdateLeadField],
  })
  @IsOptional()
  createLeadField?: UpdateLeadField[];
}
