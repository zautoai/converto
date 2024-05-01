import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
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

export class UpdateContactDto {
  @ApiProperty({ required: false, description: 'First name of the contact' })
  @IsOptional()
  @IsString()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({ description: 'First name of the contact', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name of the contact', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Title of the contact', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ required: false, description: 'Company of the contact' })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({ description: 'Email of the contact', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone Number of the contact', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Address of the contact', required: false })
  @IsString()
  @IsOptional()
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

  @ApiProperty({ description: 'Website of the contact', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Social Media of the contact', required: false })
  @IsOptional()
  socialMedia?: any;

  @ApiProperty({ description: 'Notes of the contact', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Lead Source of the contact', required: false })
  @IsString()
  @IsOptional()
  leadSource?: string;

  @ApiProperty({ description: 'Status of the contact', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Tags of the contact', required: false })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    required: false,
    description: 'Additional fields of the contact',
  })
  @ApiProperty({ type: [AdditionalFields] })
  @IsOptional()
  additionalFields?: AdditionalFields[];
}
