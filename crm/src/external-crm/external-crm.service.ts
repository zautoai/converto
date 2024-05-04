import { Injectable } from '@nestjs/common';
import { ExternalCrmProvider } from './external-crm.provider';
import { Session } from 'inspector';

@Injectable()
export class ExternalCrmService {

    constructor(
        private readonly crmProvider:ExternalCrmProvider
    ){}

    getAuthUrl(crmName:string): any {
        const crm = this.crmProvider.getCRM(crmName);
        const additionalInfo = crmName;
        const authUrl = crm.getAuthUrl(additionalInfo);
        return {
            url: authUrl,
        };
    }

    async getAccessToken(crmName:string, code:string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const accessToken = await crm.getAccessToken(code);
        return accessToken;
    }
}
