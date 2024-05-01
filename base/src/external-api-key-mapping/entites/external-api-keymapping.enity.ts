import { ApiProperty } from "@nestjs/swagger";

export class ExternalApiKeyMapping {
    @ApiProperty()
    orgId: string;

    @ApiProperty()
    apiEndpointId: string;

    @ApiProperty()
    fieldName: string;

    @ApiProperty()
    externalFieldName: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;
}