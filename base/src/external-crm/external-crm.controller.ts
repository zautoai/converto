import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { RolesGuard } from 'src/auth/roles.guard';
import { CRMAuthDto } from './dto/crm-auth.dto';
import { ZautoRequest } from 'src/common/models/request.model';
import { HubspotCallBackDto } from './dto/hubspot-callback.dto';
import { CreateCRMMappingsDto } from './dto/create-crm-mappings.dto';

@ApiTags('External CRM')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/external-crm')
export class ExternalCrmController {
  constructor(private readonly externalCrmService: ExternalCrmService) { }

  @Get('auth-url')
  async getAuthUrl(@Query() crmAuthDto: CRMAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.getAuthUrl(orgId, crmAuthDto);
  }

  @Get('callback')
  async callback(@Query() hubspotCallBackDto: HubspotCallBackDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.callback(orgId, hubspotCallBackDto);
  }

  @Get('mappings/:crm_name/:object_type')
  async getMappings(@Param('crm_name') crmName: string, @Param('object_type') object_type: string, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.getMappings(orgId, crmName,object_type);
  }

  @Post('mappings')
  async createMappings(@Body() createCRMMappingsDto: CreateCRMMappingsDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.createMappings(orgId, createCRMMappingsDto);
  }

  @Get('fields/:crm_name/:object_type')
  async getContactFields(@Param('crm_name') crmName: string,  @Param('object_type') objectType:string,@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.getFields(orgId, crmName, objectType)
  }

  @Get('profile')
  async getProfile(@Query() crmAuthDto: CRMAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.getProfile(orgId, crmAuthDto);
  }

  @Get('auto-mapping/:crm_name/:object_type')
  async getAutoMapping(@Param('crm_name') crmName: string,  @Param('object_type') objectType:string,@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.getAutoMapping(orgId, crmName, objectType)
  }

  @Delete('revoke/:crm_name')
  async revoke(@Param('crm_name') crmName: string, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.externalCrmService.revoke(orgId, crmName);
  }
}
