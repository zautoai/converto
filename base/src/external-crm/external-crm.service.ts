import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ExternalCrmMicroService } from 'src/microservices/crm_service/external-crm.service';
import { CRMAuthDto } from './dto/crm-auth.dto';
import { HubspotCallBackDto } from './dto/hubspot-callback.dto';
import { CreateCRMMappingsDto } from './dto/create-crm-mappings.dto';
import { MapperService } from 'src/assistants/services/mapper.service';
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { ObjectType } from 'src/common/enums/enums';
import { AccountMicroService } from 'src/microservices/crm_service/account.service';

@Injectable()
export class ExternalCrmService extends BaseService {

    constructor(
        private readonly externalCrmMicroService: ExternalCrmMicroService,
        private readonly contactService: ContactService,
        private readonly accountService: AccountMicroService,
        private readonly mapperService: MapperService
    ) {
        super();
    }

    async getAuthUrl(orgId: string, crmAuthDto: CRMAuthDto) {
        return this.handleException(await this.externalCrmMicroService.getAuthUrl(orgId, crmAuthDto.name))
    }

    async callback(orgId: string, hubspotCallBackDto: HubspotCallBackDto) {
        return this.handleException(await this.externalCrmMicroService.callback(orgId, hubspotCallBackDto.state, hubspotCallBackDto.code))
    }

    async getMappings(orgId: string, crmName: string, objectType:string) {
        return this.handleException(await this.externalCrmMicroService.getMappings(orgId, crmName, objectType))
    }

    async createMappings(orgId: string, createCRMMappingsDto: CreateCRMMappingsDto) {
        return this.handleException(await this.externalCrmMicroService.createMappings(orgId, createCRMMappingsDto))
    }

    async getFields(orgId: string, crmName: string, objectType: string) {
        return this.handleException(await this.externalCrmMicroService.getFields(orgId, crmName, objectType))
    }

    async getProfile(orgId: string, crmName: CRMAuthDto) {
        return this.handleException(await this.externalCrmMicroService.getProfile(orgId, crmName.name))
    }

    async revoke(orgId: string, crmName: string) {
        return this.handleException(await this.externalCrmMicroService.revoke(orgId, crmName))
    }

    async getDefaultFields(orgId:string,crmName:string,objectType: string)
    {
        switch(objectType)
        {
            case(ObjectType.CONTACT):
            {
                return (await this.contactService.getContactFields(orgId)).data;
            }
            case(ObjectType.COMPANY):
            {
                return (await this.accountService.getAccountField(orgId)).data;
            }
            default:
            {
              return null;
            }
        }
    }

    async getAutoMapping(orgId:string,crmName:string,objectType: string)
    {
        try
        {
            const defaultFields = await this.getDefaultFields(orgId,crmName,objectType);
            const externalFields = await this.getFields(orgId,crmName,objectType);
            return await this.mapperService.handleMap(defaultFields,externalFields);
        }
        catch(err)
        {
            throw new BadRequestException(err.message);
        }
    }
}
