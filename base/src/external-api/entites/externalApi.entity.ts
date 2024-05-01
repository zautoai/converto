import { ApiProperty } from "@nestjs/swagger";
import { AuthType, HttpMethod } from "src/common/enums/enums";

export class ExternalApi {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orgId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  username?: string;

  @ApiProperty()
  password?: string;

  @ApiProperty()
  token?: string;

  @ApiProperty()
  authType: AuthType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  modifiedAt: Date;

}