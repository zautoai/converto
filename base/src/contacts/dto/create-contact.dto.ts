import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    validateOrReject
} from 'class-validator';

export class CreateContactDto {
    @ApiProperty({
        required: false,
        description: 'First name of the contact',
        example: 'https://example.com/photo.jpg',
    })
    @IsOptional()
    @IsString()
    @IsUrl()
    photoUrl?: string;

    @ApiProperty({ required: false, description: 'Full name of the contact' })
    @IsOptional()
    @IsString()
    fullName?: string;

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

    @ApiProperty({
        required: true,
        description: 'Email of the contact',
        example: 'example@example.com',
    })
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

    @ApiProperty({ required: false, description: 'Visitor Id from which the contact is created' })
    @IsOptional()
    @IsString()
    visitorId?: string;

    @ApiProperty({ required: false, description: 'Account Id of the contact' })
    @IsOptional()
    @IsString()
    accountId?: string;


    async validate() {
        try {
            await validateOrReject(this, { skipMissingProperties: true });
        } catch (errors) {
            const messages = errors
                .map((error) => Object.values(error.constraints))
                .join(', ');
            throw Error(messages);
        }
    }

    constructor(data: Partial<CreateContactDto>) {
        Object.assign(this, data);
    }
}
