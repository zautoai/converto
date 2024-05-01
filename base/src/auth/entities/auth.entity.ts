import { ApiProperty } from "@nestjs/swagger";
import { Agent } from "src/agent/entities/agent.entity";
import { User } from "src/users/entities/user.entity";

export class AuthEntity {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    user: User;

    @ApiProperty()
    avatar: Agent;
}