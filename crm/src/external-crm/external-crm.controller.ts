import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { CrmNames } from './enum/external-crm.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HubspotCallBackDto } from './dto/hubspot-callback.dto';
import { CRMAuthDto } from './dto/crm-auth.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';

@ApiTags('External CRM')
@Controller('external-crm') 
export class ExternalCrmController {
  constructor(private readonly externalCrmService: ExternalCrmService) {}

  @Get('auth-url')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getAuthUrl(@Query() crmAuthDto:CRMAuthDto,@Req() request: IRequest) {
    const orgId = request.orgId;
    return this.externalCrmService.getAuthUrl(orgId,crmAuthDto.name);
  }
  
  @Get('callback')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async callback(@Query() hubspotCallBackDto:HubspotCallBackDto,@Req() request: IRequest) {
    const orgId = request.orgId;
    return await this.externalCrmService.exchangeCodeForAccessToken(orgId,hubspotCallBackDto.state,hubspotCallBackDto.code);
  }
}
