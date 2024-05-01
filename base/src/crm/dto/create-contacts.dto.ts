import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

class AdditionalFields {
  @ApiProperty({ required: true, description: 'Id of the additional field' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ required: true, description: 'Value of the additional field' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateContactDto {
  @ApiProperty({ required: false, description: 'First name of the contact' })
  @IsOptional()
  @IsString()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({ required: false, description: 'First name of the contact' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, description: 'Last name of the contact' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, description: 'Title of the contact' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ required: false, description: 'Company of the contact' })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({ required: true, description: 'Email of the contact' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, description: 'Phone Number of the contact' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, description: 'Address of the contact' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, description: 'Address of the contact' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, description: 'Address of the contact' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false, description: 'Address of the contact' })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiProperty({ required: false, description: 'Address of the contact' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, description: 'Website of the contact' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false, description: 'Social Media of the contact' })
  @IsOptional()
  socialMedia?: any;

  @ApiProperty({ required: false, description: 'Notes of the contact' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, description: 'Lead Source of the contact' })
  @IsOptional()
  @IsString()
  leadSource?: string;

  @ApiProperty({ required: false, description: 'Status of the contact' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    required: false,
    description: 'Additional fields of the contact',
  })
  @ApiProperty({ type: [AdditionalFields] })
  @IsOptional()
  additionalFields?: AdditionalFields[];
}
