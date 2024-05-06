import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { CrmNames } from './enum/external-crm.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HubspotCallBackDto } from './dto/hubspot-callback.dto';
import { CRMAuthDto } from './dto/crm-auth.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';
import { MappingService } from './mapping.service';
import { CreateCRMMappingsDto } from './dto/create-crm-mappings.dto';

@ApiTags('External CRM')
@Controller('external-crm') 
export class ExternalCrmController {
  constructor(
    private readonly externalCrmService: ExternalCrmService,
  ) {}

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

  @Get('access-token')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getAccessToken(@Query() crmAuthDto:CRMAuthDto, @Req() request: IRequest) {
    const orgId = request.orgId;
    return await this.externalCrmService.getAccessToken(orgId, crmAuthDto.name);
  }

  @Get('mappings/:crm_name')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getMappings(@Param('crm_name')crmName:string,@Req() request: IRequest) {
    const orgId = request.orgId;
    return await this.externalCrmService.getMappingsByCrmName(orgId, crmName);
  }

  @Post('mappings')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createMappings(@Body() createCRMMappingsDto:CreateCRMMappingsDto,@Req() request: IRequest) {
    const orgId = request.orgId;
    return await this.externalCrmService.createMappings(orgId, createCRMMappingsDto);
  }
}


