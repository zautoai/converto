import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BaseExternalCrm } from '../external-crm.model';
import { CrmNames } from '../enum/external-crm.enum';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class HubspotService extends BaseExternalCrm {

    constructor(private readonly httpService:HttpService) {
        super({
            name: CrmNames.HUBSPOT,
            clientId: process.env.HUBSPOT_CLIENT_ID,
            clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
            redirectUri: process.env.HUBSPOT_REDIRECT_URI,
            scope: 'crm.schemas.contacts.read crm.schemas.contacts.write'
        });
    }

    getAuthUrl(additionalInfo:any): string {
        const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${this.scope}&state=${additionalInfo}`;
        return authUrl;
    }

    async getAccessToken(code: string): Promise<any> {
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
            return response.data;
        } catch (error) {
            throw new BadRequestException(error.response?.data || 'Failed to fetch access token');
        }
    }
    

}
