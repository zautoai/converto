import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ExternalCrmMicroService } from 'src/microservices/crm_service/external-crm.service';
import { CRMAuthDto } from './dto/crm-auth.dto';
import { HubspotCallBackDto } from './dto/hubspot-callback.dto';
import { CreateCRMMappingsDto } from './dto/create-crm-mappings.dto';

@Injectable()
export class ExternalCrmService extends BaseService {

    constructor(private readonly externalCrmMicroService: ExternalCrmMicroService) {
        super();
    }

    async getAuthUrl(orgId: string, crmAuthDto: CRMAuthDto) {
        return this.handleException(await this.externalCrmMicroService.getAuthUrl(orgId, crmAuthDto.name))
    }

    async callback(orgId: string, hubspotCallBackDto: HubspotCallBackDto) {
        return this.handleException(await this.externalCrmMicroService.callback(orgId, hubspotCallBackDto.state, hubspotCallBackDto.code))
    }

    async getMappings(orgId: string, crmName: string) {
        return this.handleException(await this.externalCrmMicroService.getMappings(orgId, crmName))
    }

    async createMappings(orgId: string, createCRMMappingsDto: CreateCRMMappingsDto) {
        return this.handleException(await this.externalCrmMicroService.createMappings(orgId, createCRMMappingsDto))
    }

    async getFields(orgId: string, crmName: string) {
        return this.handleException(await this.externalCrmMicroService.getFields(orgId, crmName))
    }
}
