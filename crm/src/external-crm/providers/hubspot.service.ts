import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseExternalCrm } from '../external-crm.model';
import { CrmNames } from '../enum/external-crm.enum';
import { HttpService } from '@nestjs/axios';
import { Token } from '../interfaces/token.interface';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { Client } from "@hubspot/api-client";
import { FilterOperatorEnum, PublicGdprDeleteInput, SimplePublicObjectInput, SimplePublicObjectInputForCreate } from '@hubspot/api-client/lib/codegen/crm/contacts';

@Injectable()
export class HubspotService extends BaseExternalCrm {
   
    constructor(
        private readonly httpService:HttpService,
        private readonly prismaClientManager: PrismaClientManager
    ) {
        super({
            name: CrmNames.HUBSPOT,
            clientId: process.env.HUBSPOT_CLIENT_ID,
            clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
            redirectUri: process.env.HUBSPOT_REDIRECT_URI,
            scope: 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.companies.read crm.objects.companies.write settings.users.read'
        });
    }

    getAuthUrl(orgId:string,additionalInfo:any): string {
        const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${this.scope}&state=${additionalInfo}`;
        return authUrl;
    }

    async exchangeCodeForAccessToken(orgId:string,code: string): Promise<any> {
        const tokenEndpoint = 'https://api.hubapi.com/oauth/v1/token';
        const requestBody = {
            grant_type: 'authorization_code',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            code: code
        };
    
        try {
            const response = await this.httpService.post(tokenEndpoint, requestBody, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).toPromise();
            await this.handleToken(orgId,response.data);
            return {
                statusCode: 200,
                message: 'Access token fetched successfully',
                data: null
            };
        } catch (error) {
            throw new BadRequestException(error.response?.data || 'Failed to fetch access token');
        }
    }

    async exchangeRefreshTokenForAccessToken(orgId: string, refreshToken: string): Promise<any> {
        const tokenEndpoint = 'https://api.hubapi.com/oauth/v1/token';
        const requestBody = {
            grant_type: 'refresh_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            refresh_token: refreshToken
        };

        try {
            const response = await this.httpService.post(tokenEndpoint, requestBody, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).toPromise();
            await this.handleToken(orgId, response.data);
            return response.data;
        } catch (error) {
            throw new BadRequestException(error.response?.data || 'Failed to fetch access token');
        }
    }

    async getAccessToken(orgId:string): Promise<any> {
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const hubspotToken = await prisma.externalCrmCredential.findFirst({
                where: {
                    crmName: this.crmName 
                }
            });
            if(this.isTokenExpired(hubspotToken.expiresIn, hubspotToken.modifiedAt))
            {
                const data = await this.exchangeRefreshTokenForAccessToken(orgId,hubspotToken.refreshToken);
                return data.access_token;   
            }
            return hubspotToken.accessToken;
        }
        catch(e)
        {
            this.logger.error(e.message);
            return null;
        }
    }

    async handleToken(orgId:string,tokenData: Token): Promise<void> {
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const hubspotToken = await prisma.externalCrmCredential.findFirst({
                where: {
                    crmName: this.crmName
                }
            });
            if (hubspotToken) {
                await prisma.externalCrmCredential.update({
                    where: {
                        id: hubspotToken.id
                    },
                    data: {
                        ...tokenData.access_token ? {accessToken: tokenData.access_token} : {},
                        ...tokenData.refresh_token ? {refreshToken: tokenData.refresh_token} : {},
                        ...tokenData.expires_in ? {expiresIn: tokenData.expires_in} : {},
                        ...tokenData.token_type ?{tokeType: tokenData.token_type} : {}
                    }
                });
            } else {
                await prisma.externalCrmCredential.create({
                    data: {
                        crmName: this.crmName,
                        accessToken: tokenData.access_token,
                        refreshToken: tokenData.refresh_token,
                        expiresIn: tokenData.expires_in,
                        ...tokenData.token_type ?{tokeType: tokenData.token_type} : {}
                    }
                });
            }
        }
        catch(e)
        {
            this.logger.error(e.message);
        }
    }    

    async getProfile(orgId:string): Promise<any> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            const hubspotClient = new Client({ accessToken:  accessToken});
            const profile = await hubspotClient.settings.users.usersApi.getPage();
            return profile.results[0];
        }
        catch(err)
        {
            return null;
        }
    }

    async getContactProperties(orgId:string): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const properties = await hubspotClient.apiRequest({
            method: 'GET',
            path: '/crm/v3/properties/contacts',
            qs: {
                properties:['name','label','type'], 
             }
        });
        return properties.json();
    }

    async getCompanyProperties(orgId:string): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const properties = await hubspotClient.apiRequest({
            method: 'GET',
            path: '/crm/v3/properties/companies',
            qs: {
                properties:['name','label','type'],
             }
        });
        const _updatedFields = await properties.json();
        return _updatedFields.results;
    }

    // contact crud
    async getContacts(orgId:string): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const contacts = await hubspotClient.crm.contacts.getAll();
        const _contacts = contacts.map(contact => {
            return contact.properties;
        });
        return _contacts;
    }
    async getContact(orgId: string, id: any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const contact = await hubspotClient.crm.contacts.basicApi.getById(id);
        return contact.properties;
    }
    async getContactByEmail(orgId: string, email: string): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const contact = await hubspotClient.crm.contacts.searchApi.doSearch({
            filterGroups: [
                {
                    filters: [
                        {
                            propertyName: 'email',
                            operator: FilterOperatorEnum.Eq,
                            value: email,
                        }
                    ]
                }
            ],
            limit: 100,
            after: '',
            sorts: [],
            properties: []
        });
        return contact.results[0].properties || null; 
    }
    async createContact(orgId: string, data: any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const payload = new SimplePublicObjectInputForCreate()
        payload.properties = data;
        const contact = await hubspotClient.crm.contacts.basicApi.create(payload);
        return contact.properties;
    }
    async updateContact(orgId: string, id:any, data: any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const payload = new SimplePublicObjectInput();
        payload.properties = data;
        const contact = await hubspotClient.crm.contacts.basicApi.update(id, payload);
        return contact.properties;
    }
    async deleteContact(orgId: string, id:any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const payload = new PublicGdprDeleteInput();
        payload.objectId = id;
        const contact = await hubspotClient.crm.contacts.gdprApi.purge(payload);
        return contact;
    }
    
    // company crud
    async getCompanies(orgId: string): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const companies = await hubspotClient.crm.companies.getAll()
        const _companies = companies.map(company => {
            return company.properties;
        });
        return _companies;
    }
    async getCompany(orgId: string, id: any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const company = await hubspotClient.crm.companies.basicApi.getById(id);
        return company.properties;
    }
    async createCompany(orgId: string, data: any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const payload = new SimplePublicObjectInputForCreate()
        payload.properties = data;
        const company = await hubspotClient.crm.companies.basicApi.create(payload);
        return company.properties;
    }
    async updateCompany(orgId: string, id:any, data: any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const payload = new SimplePublicObjectInput();
        payload.properties = data;
        const company = await hubspotClient.crm.companies.basicApi.update(id, payload);
        return company.properties;
    }
    async deleteCompany(orgId: string, id:any): Promise<any> {
        const accessToken = await this.getAccessToken(orgId);
        if(!accessToken) return null;
        const hubspotClient = new Client({ accessToken:  accessToken});
        const payload = new PublicGdprDeleteInput();
        payload.objectId = id;
        const company = await hubspotClient.crm.companies.gdprApi.purge(payload);
        return company;
    }
}
