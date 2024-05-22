import { ApiProperty } from "@nestjs/swagger";
import { ConversationType } from '../../common/enums/enums';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";



export class CreateAgentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  usetools: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  companyBusiness: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  companyValue: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  purpouse: string;

  @ApiProperty({ enum: ConversationType }) // Specify enum values for Swagger
  @IsNotEmpty()
  @IsEnum(ConversationType)
  conversationType: ConversationType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  welcomeMsg?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  useAssistant?: boolean = true;

  @ApiProperty()
  @IsString()
  @IsOptional()
  llmModel?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fileId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  siteObjUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  styles?: string = ''; 

}
