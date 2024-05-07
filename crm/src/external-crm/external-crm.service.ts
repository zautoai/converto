import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExternalCrmProvider } from './external-crm.provider';
import { CreateCRMMappingsDto } from './dto/create-crm-mappings.dto';
import { MappingService } from './mapping.service';
import { CrmNames, ObjectType } from './enum/external-crm.enum';

@Injectable()
export class ExternalCrmService implements OnModuleInit{

    constructor(
        private readonly crmProvider:ExternalCrmProvider,
        private readonly mappingService: MappingService
    ){}

    async onModuleInit() {

    }

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
    async getProfile(orgId:string, crmName:string)
    {
        const crm = this.crmProvider.getCRM(crmName);
        const profile = await crm.getProfile(orgId);
        return profile;
    }

    async getContactFields(orgId:string, crmName:string)
    {
        const crm = this.crmProvider.getCRM(crmName);
        const fields = await crm.getCompanyProperties(orgId);
        return fields;
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
    async getContactByEmail(orgId:string, crmName:string, email:string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.getContactByEmail(orgId, email);
        return contact;
    }
    async createContact(orgId:string, crmName:string, data:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const mappedData = await this.handleMapping(orgId,crmName, ObjectType.CONTACT, data);
        const objects = Object.keys(mappedData);
        if(objects.length === 0) return null;
        const contact = await crm.createContact(orgId, mappedData);
        return contact;
    } 
    async updateContact(orgId:string, crmName:string, id:any, data:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const mappedData = await this.handleMapping(orgId,crmName, ObjectType.CONTACT, data);
        const objects = Object.keys(mappedData);
        if(objects.length === 0) return null;
        const contact = await crm.updateContact(orgId, id, mappedData);
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
        const mappedData = await this.handleMapping(orgId,crmName, ObjectType.COMPANY, data);
        const objects = Object.keys(mappedData);
        if(objects.length === 0) return null;
        const company = await crm.createCompany(orgId, mappedData);
        return company;
    }
    async updateCompany(orgId:string, crmName:string, id:any, data:any): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const mappedData = await this.handleMapping(orgId,crmName, ObjectType.COMPANY, data);
        const objects = Object.keys(mappedData);
        if(objects.length === 0) return null;
        const company = await crm.updateCompany(orgId, id, mappedData);
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
    async handleMapping(orgId: string, crmName: string, objectType:string,data: any): Promise<any> {

        const mappings = await this.mappingService.getMappingsBycrmNameAndObjectType(orgId, crmName, objectType);
        let mappedData = {};
        for(const mapping of mappings)
        {
            const externalCRMFieldName = mapping.externalCRMFieldName;
            const fieldName = mapping.fieldName;
            if(externalCRMFieldName == null) continue;
            mappedData[externalCRMFieldName] = data[fieldName]; 
        }
        return mappedData;       
    }
 
}
