import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateSubscriptionPlanDto {
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
  @IsString()
  type: string = 'monthly';


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

  @ApiProperty({ description: 'Number of Users' })
  @IsInt()
  userCount: number;

  @ApiProperty()
  @IsNumber()
  price: number;
}
