import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum PlanType {
  MONTHLY='MONTHLY',
  YEARLY='YEARLy'
}

export class SubscriptionPlan {
  @ApiProperty({ description: 'Unique identifier of the subscription plan' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Name of the subscription plan', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description of the subscription plan' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of the subscription plan' })
  @IsEnum(PlanType)
  @IsOptional()
  type: PlanType = PlanType.MONTHLY;

  @ApiProperty({ description: 'Number of agents' })
  @IsInt()
  agentsCount: number;

  @ApiProperty({ description: 'Number of messages' })
  @IsInt()
  messageCount: number;

  @ApiProperty({ description: 'Number of sites' })
  @IsInt()
  sitesCount: number;

  @ApiProperty({ description: 'Number of Campaigns' })
  @IsInt()
  campaignCount: number;

  @ApiProperty({ description: 'Number of users' })
  @IsInt()
  userCount: number;

  @ApiProperty({ description: 'Timestamp of when the subscription plan was created', example: '2023-01-01T00:00:00.000Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of the last update to the subscription plan', example: '2023-01-02T00:00:00.000Z' })
  @IsDateString()
  modifiedAt: Date;

}
