import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BaseExternalCrm } from '../external-crm.model';
import { CrmNames } from '../enum/external-crm.enum';
import { HttpService } from '@nestjs/axios';
import { Token } from '../interfaces/token.interface';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';

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
            scope: 'crm.schemas.contacts.read crm.schemas.contacts.write'
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
            if(this.isTokenExpired(hubspotToken.expiresIn))
            {
                const accessToken = await this.exchangeRefreshTokenForAccessToken(orgId,hubspotToken.refreshToken);
                return accessToken.data.access_token;   
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

    private isTokenExpired(expiresIn: any): boolean {
        const currentTime = Math.floor(Date.now() / 1000);
        return expiresIn < currentTime;
    }
}
