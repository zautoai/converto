
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../../organizations/entities/organization.entity'; // Assuming you have an Organization entity


export class Agent {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orgId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  usetools: boolean;

  @ApiProperty()
  role: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  companyBusiness: string;

  @ApiProperty()
  companyValue: string;

  @ApiProperty()
  purpouse: string;

  @ApiProperty()
  conversationType: string;

  @ApiProperty()
  logoUrl: string;

  @ApiProperty()
  welcomeMsg: string;

  @ApiProperty()
  llmModel: string;

  @ApiProperty()
  useAssistant: boolean;

  @ApiProperty()
  assistantId: string;

  @ApiProperty()
  siteObjUrl: string;

  //@ApiProperty()
  //org: Organization;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  modifiedAt: Date;

  @ApiProperty()
  AgentFiles?: any[]; // Assuming you have an AgentFile entity 

  @ApiProperty()
  styles: string;

  @ApiProperty()
  autoAnalysis: boolean;

}

export enum AgentStatus {
  TRAINING = 'TRAINING',
  TRAININGFAILED = 'TRAININGFAILED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

