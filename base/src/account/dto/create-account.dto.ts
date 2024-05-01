import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { OrgAccountStatus } from 'src/common/enums/enums';

export class CreateOrgAccountDto {
  @ApiProperty({ description: 'Unique identifier of the organization' })
  @IsNotEmpty()
  @IsString()
  orgId: string;

  @ApiProperty({ description: 'Unique identifier of the subscription plan' })
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;

  @ApiProperty()
  @IsString()
  status: OrgAccountStatus;
}
