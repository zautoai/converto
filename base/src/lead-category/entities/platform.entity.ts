import { ApiProperty } from "@nestjs/swagger";
import { Organization } from "src/organizations/entities/organization.entity";

export class LeadCategory{

    @ApiProperty()
    id: string;

    @ApiProperty()
    orgId: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;
}