import { ApiProperty } from "@nestjs/swagger";
import { Agent } from "src/agent/entities/agent.entity";
import { SiteProcessStatus } from "src/common/enums/enums";

export class Site {
    @ApiProperty()
    id: string;

    @ApiProperty()
    agent: Agent;

    @ApiProperty()
    url: string;

    @ApiProperty()
    info: string;

    @ApiProperty()
    status: SiteProcessStatus;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;
}
