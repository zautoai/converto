import { ApiProperty } from "@nestjs/swagger";
import { ConversationType } from '../../common/enums/enums';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateConversationDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  visitorId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  visitId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  campaignId?: string;

  @ApiProperty({ enum: ConversationType }) // Specify enum values for Swagger
  @IsNotEmpty()
  @IsEnum(ConversationType)
  type: ConversationType = ConversationType.CHAT;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  threadId?: string;

}


export class CreateAgentConversationDto {

  @ApiProperty({ enum: ConversationType }) // Specify enum values for Swagger
  @IsNotEmpty()
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  threadId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agentId: string;


}

