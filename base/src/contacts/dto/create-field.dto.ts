import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum DataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export class CreateFieldDto {
  @ApiProperty({ required: true, description: 'Name of the Field' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    description: 'Type of the Field',
    enum: DataType,
  })
  @IsOptional()
  @IsEnum(DataType)
  dataType?: DataType;

}
