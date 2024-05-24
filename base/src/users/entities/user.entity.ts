import { ApiProperty } from "@nestjs/swagger";
import { Organization } from "src/organizations/entities/organization.entity";
import { Role } from "src/roles/entities/role.entity";

export class User {

    @ApiProperty()
    id: string

    @ApiProperty()
    name: string;

    @ApiProperty()
    imgUrl: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;

    @ApiProperty()
    role: Role;

    @ApiProperty()
    verified: boolean;

    @ApiProperty()
    orgId: string; 

    @ApiProperty()
    googleAccessToken?: string;
}
