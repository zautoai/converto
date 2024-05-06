import { Injectable } from '@nestjs/common';
import { ExternalCrmProvider } from './external-crm.provider';
import { Session } from 'inspector';
import { CreateCRMMappingsDto } from './dto/create-crm-mappings.dto';
import { MappingService } from './mapping.service';

@Injectable()
export class ExternalCrmService {

    constructor(
        private readonly crmProvider:ExternalCrmProvider,
        private readonly mappingService: MappingService
    ){}

    getAuthUrl(orgId:string,crmName:string): any {
        const crm = this.crmProvider.getCRM(crmName);
        const additionalInfo = crmName;
        const authUrl = crm.getAuthUrl(orgId,additionalInfo);
        return {
            url: authUrl,
        };
    }
    async exchangeCodeForAccessToken(orgId:string,crmName:string, code:string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const accessToken = await crm.exchangeCodeForAccessToken(orgId,code);
        return accessToken;
    }
    async getAccessToken(orgId:string, crmName:string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const accessToken = await crm.getAccessToken(orgId);
        return accessToken;
    }

    async getContacts(orgId:string, crmName:string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const contacts = await crm.getContacts(orgId);
        return contacts;
    }
    async getContact(orgId:string, crmName:string, id:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.getContact(orgId, id);
        return contact;
    }
    async createContact(orgId:string, crmName:string, data:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.createContact(orgId, data);
        return contact;
    }
    async updateContact(orgId:string, crmName:string, id:any, data:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.updateContact(orgId, id, data);
        return contact;
    }
    async deleteContact(orgId:string, crmName:string, id:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.deleteContact(orgId, id);
        return contact;
    }

    async getCompanies(orgId:string, crmName:string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const companies = await crm.getCompanies(orgId);
        return companies;
    }
    async getCompany(orgId:string, crmName:string, id:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const company = await crm.getCompany(orgId, id);
        return company;
    }
    async createCompany(orgId:string, crmName:string, data:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const company = await crm.createCompany(orgId, data);
        return company;
    }
    async updateCompany(orgId:string, crmName:string, id:any, data:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const company = await crm.updateCompany(orgId, id, data);
        return company;
    }
    async deleteCompany(orgId:string, crmName:string, id:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const company = await crm.deleteCompany(orgId, id);
        return company;
    }

    async getMappingsByCrmName(orgId:string, crmName: string)
    {
        return await this.mappingService.getMappingsByCrmName(orgId, crmName);
    }

    async createMappings(orgId:string, createCRMMappingsDto:CreateCRMMappingsDto): Promise<any> {
        for(const _mapping of createCRMMappingsDto.mappings) {
            const mapping = await this.mappingService.getMappingByCrmNameAndObjectTypeAndField(orgId, _mapping.crmName, _mapping.objectType, _mapping.fieldName);
            if(mapping){
                if(_mapping.externalCRMFieldName == null)
                {
                    await this.mappingService.deleteMapping(orgId, mapping.id);
                }
                else if(mapping.externalCRMFieldName !== _mapping.externalCRMFieldName)
                {
                    await this.mappingService.updateMapping(orgId, mapping.id, _mapping);
                }
                continue;
            };
            if(_mapping.externalCRMFieldName == null) continue;
            await this.mappingService.createMapping(orgId, _mapping);
        }
        return {
            status: 200,
            message: 'success',
            data:createCRMMappingsDto.mappings
        };
    }

}
