import { Injectable } from '@nestjs/common';
import { ExternalCrmProvider } from './external-crm.provider';
import { Session } from 'inspector';

@Injectable()
export class ExternalCrmService {

    constructor(
        private readonly crmProvider:ExternalCrmProvider
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

}
