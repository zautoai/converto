import { Controller, Get, Query } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { CrmNames } from './enum/external-crm.enum';
import { ApiTags } from '@nestjs/swagger';
import { HubspotCallBackDto } from './dto/hubspot-callback.dto';
import { CRMAuthDto } from './dto/crm-auth.dto';

@ApiTags('External CRM')
@Controller('external-crm') 
export class ExternalCrmController {
  constructor(private readonly externalCrmService: ExternalCrmService) {}

  @Get('auth-url')
  async getAuthUrl(@Query() crmAuthDto:CRMAuthDto) {
    return this.externalCrmService.getAuthUrl(crmAuthDto.name);
  }

  @Get('callback')
  async callback(@Query() hubspotCallBackDto:HubspotCallBackDto) {
    return await this.externalCrmService.getAccessToken(hubspotCallBackDto.state,hubspotCallBackDto.code);
  }
}
