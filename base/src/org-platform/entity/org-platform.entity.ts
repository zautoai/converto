import { ApiProperty } from "@nestjs/swagger";

export class OrgPlatform{
    @ApiProperty()
    id: string;

    @ApiProperty()
    orgId: string;

    @ApiProperty()
    platform: [string];
}