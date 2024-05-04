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
}
