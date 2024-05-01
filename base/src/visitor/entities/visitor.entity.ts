import { ApiProperty } from "@nestjs/swagger";
import { Agent } from "src/agent/entities/agent.entity";
import { ConversationType } from "src/common/enums/enums";

export class Visitor {
    @ApiProperty()
    id: string;
    
    @ApiProperty()
    agent: Agent;

    @ApiProperty()
    userAgent: string;

    @ApiProperty()
    infoJson: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;
}
