import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUrl,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateAccountBasedMarketingDto {
  @ApiProperty({
    required: false,
    description: 'The photo URL of the account based marketing',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({
    required: true,
    description: 'The name of the target account',
  })
  @IsString()
  targetAccountName: string;

  @ApiProperty({
    required: true,
    description: 'The industry of the target account',
  })
  @IsString()
  industry: string;

  @ApiProperty({
    required: true,
    description: 'The size of the target account',
  })
  @IsString()
  accountSize: string;

  @ApiProperty({
    required: true,
    description: 'The revenue potential of the target account',
  })
  @IsNumber()
  revenuePotential: number;

  @ApiProperty({
    required: true,
    description: 'The decision makers associated with the target account',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  decisionMakers: string[];

  @ApiProperty({
    required: true,
    description: 'The pain points of the target account',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  painPoints: string[];

  @ApiProperty({
    required: true,
    description: 'The buying stage of the target account',
  })
  @IsString()
  buyingStage: string;

  @ApiProperty({
    required: true,
    description: 'Campaigns associated with the target account',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  campaigns: string[];

  @ApiProperty({
    required: true,
    description: 'Team members associated with the target account',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  teamMembers: string[];
}
