import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Organization } from 'src/organizations/entities/organization.entity';
import { SubscriptionPlan } from 'src/subscription-plan/entities/subscription-plan.entity';


export class OrgAccount {
  @ApiProperty({ description: 'Unique identifier of the organization' })
  @IsNotEmpty()
  @IsString()
  orgId: string;

  @ApiProperty({ description: 'Unique identifier of the subscription plan' })
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;

  @ApiProperty({ description: 'Number of used bots' })
  @IsInt()
  usedBotsCount: number;

  @ApiProperty({ description: 'Number of used messages' })
  @IsInt()
  usedMessageCount: number;

  @ApiProperty({ description: 'Number of used campaigns' })
  @IsInt()
  usedCampaignCount: number;

  @ApiProperty({ description: 'Number of used sites' })
  @IsInt()
  usedSitesCount: number;

  @ApiProperty({ description: 'Number of used users' })
  @IsInt()
  usedUserCount: number;

  @ApiProperty({ description: 'Timestamp of when the account was created', example: '2023-01-01T00:00:00.000Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of the last update to the account', example: '2023-01-02T00:00:00.000Z' })
  @IsDateString()
  modifiedAt: Date;

  // If you have defined entities for Organization and SubscriptionPlan, include them as well
  org: Organization;
  subscription: SubscriptionPlan; 
}
