import { ApiProperty } from "@nestjs/swagger";

import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ConversationType } from "src/common/enums/enums";

export class CreateVisitorDto {
  @ApiProperty()
  @IsString()
  userAgent: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ipAddress?: string;


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  infoJson: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  trackingInfo?: string;
  
}
