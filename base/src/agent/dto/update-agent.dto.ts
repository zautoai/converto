import { ApiProperty } from '@nestjs/swagger';
import { ConversationType } from '../../common/enums/enums';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAgentDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  displayName: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  usetools?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  companyBusiness?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  companyValue?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  purpouse?: string;

  @ApiProperty({ enum: ConversationType }) // Specify enum values for Swagger
  @IsEnum(ConversationType)
  @IsOptional()
  conversationType?: ConversationType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  welcomeMsg?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  styles?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  autoAnalysis: boolean = false;

  @ApiProperty()
  @IsString()
  @IsOptional()
  leadInfo: string;
}
