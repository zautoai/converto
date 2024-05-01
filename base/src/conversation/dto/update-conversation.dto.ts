import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { ConversationType } from 'src/common/enums/enums';


export class UpdateAgentConversationDto {

  @ApiProperty({ enum: ConversationType }) // Specify enum values for Swagger
  @IsEnum(ConversationType)
  type: ConversationType;
}
