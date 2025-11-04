import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class ContactRequestDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  name: string;

  @ApiProperty({ example: '+1-555-123-4567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-() ]{6,20}$/,{ message: 'mobile must contain only numbers and common phone symbols' })
  mobile: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'I would like to know more about your product.' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 5000)
  message: string;

  @ApiProperty({ required: false, description: 'Optional source or page identifier' })
  @IsOptional()
  @IsString()
  source?: string;
}
