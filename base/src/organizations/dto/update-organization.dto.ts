import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
    @Transform(({ value }) => value)
    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    siteUrl?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    emails:string[];
}
