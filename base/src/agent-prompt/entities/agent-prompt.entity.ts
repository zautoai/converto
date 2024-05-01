import { ApiProperty } from "@nestjs/swagger";
import { Agent } from "http";

export class AgentPrompt {

    @ApiProperty()
    id: string;

    @ApiProperty()
    agent: Agent;

    @ApiProperty()
    text: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;

}
