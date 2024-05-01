import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";
import { Conversation } from "src/conversation/entities/conversation.entity";

export class Lead {

    @ApiProperty()
    id: string;

    @ApiProperty()
    @IsNumber()
    converation: Conversation;
  
    @ApiProperty()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsEmail()
    email?: string;
  
    @ApiProperty()
    @IsString()
    mobile?: string;
  
    @ApiProperty()
    @IsString()
    whatsapp?: string;
  
    @ApiProperty()
    @IsString()
    city?: string;
  
    @ApiProperty()
    @IsString()
    info?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;
}
