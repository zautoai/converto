import { ApiProperty } from "@nestjs/swagger";

export class Organization {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    siteUrl: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;
}
