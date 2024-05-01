import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

import { IsEnum, IsString } from "class-validator";
import { skip } from "node:test";
import { Agent } from "src/agent/entities/agent.entity";
import { ConversationType } from "src/common/enums/enums";
import { toNumber } from "src/common/helpers/cast.helper";


export enum Sentimental {
    POSITIVE='POSITIVE',
    NEGATIVE='NEGATIVE',
    NUTRAL='NUTRAL'
}

export enum ConversationStatus {
  ONLINE='ONLINE',
  OFFLINE='OFFLINE',
}

export class Conversation {

    @ApiProperty()
    id: string;

    @ApiProperty()
    orgId: string;

    @ApiProperty()
    agentId: string;

    @ApiProperty()
    agent: Agent;
  
    @ApiProperty({ enum: ConversationType }) // Specify enum values for Swagger
    @IsEnum(ConversationType)
    type: ConversationType;

    @ApiProperty()
    createdAt: Date;
    
    @ApiProperty()
    modifiedAt: Date;

    @ApiProperty()
    summary: string;

    @ApiProperty()
    sentimental: string;

    @ApiProperty()
    suggestions: string;

    @ApiProperty()
    @Transform(({ value }) => toNumber(value))
    summaryUpdatedAt: number;
}
