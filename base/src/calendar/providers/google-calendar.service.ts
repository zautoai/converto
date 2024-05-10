import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseCalendar } from '../calendar.model';
import { CalendarName } from '../enum/calendar.enum';
import { Token } from '../interface/token.inteface';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoogleCalendarService extends BaseCalendar{

    constructor(
        private readonly httpService:HttpService,
        private readonly prisma: PrismaService
    )
    {
        super({
            name: CalendarName.GOOGLE,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_CALBACK_URI,
            scope: 'profile email https://www.googleapis.com/auth/calendar'
        }
    );
    }

    getAuthUrl(orgId: string, additionalInfo: any): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: this.scope,
            response_type: 'code',
            access_type: "offline",
            prompt: "select_account",
            ...additionalInfo,
        });
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
        return authUrl;

    }
    async exchangeCodeForAccessToken(orgId: string, code: string): Promise<any> {
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
        const requestBody = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            code: code,
            grant_type: 'authorization_code',
            access_type: "offline",
            prompt: "select_account"
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
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
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

    async handleToken(orgId: string, tokenData: Token): Promise<void> {
        const googleCalendar = await this.prisma.externalToolCredential.findFirst({
            where: {
                toolName: this.calendarName
            }
        })
        if (googleCalendar) {
            await this.prisma.externalToolCredential.update({
                where: {
                    id: googleCalendar.id
                },
                data: {
                    ...tokenData.access_token ? {accessToken: tokenData.access_token} : {},
                    ...tokenData.refresh_token ? {refreshToken: tokenData.refresh_token} : {},
                    ...tokenData.expires_in ? {expiresIn: tokenData.expires_in} : {},
                    ...tokenData.token_type ?{tokeType: tokenData.token_type} : {}
                }
            });
        } else {
            await this.prisma.externalToolCredential.create({
                data: {
                    toolName: this.calendarName,
                    accessToken: tokenData.access_token,
                    refreshToken: tokenData.refresh_token,
                    expiresIn: tokenData.expires_in,
                    ...tokenData.token_type ?{tokeType: tokenData.token_type} : {}
                }
            });
        }
    }

    async getAccessToken(orgId: string): Promise<any> {
        try
        {
            const googleCalendarToken = await this.prisma.externalToolCredential.findFirst({
                where: {
                    toolName: this.calendarName 
                }
            });
            if(!googleCalendarToken) throw new Error('Plugin not connected!.');
            if(this.isTokenExpired(googleCalendarToken.expiresIn, googleCalendarToken.modifiedAt))
            {
                const data = await this.exchangeRefreshTokenForAccessToken(orgId,googleCalendarToken.refreshToken);
                return data.access_token;   
            }
            return googleCalendarToken.accessToken;
        }
        catch(e)
        {
            this.logger.error(e.message);
            throw new Error(e);
        }
    }
    async revokeAccess(orgId: string): Promise<any> {
        try
        {
            const existingCredential = await this.prisma.externalToolCredential.findFirst({where:{toolName:this.calendarName}});
            if(existingCredential)
            {
                let tokenEndpoint = 'https://accounts.google.com/o/oauth2/revoke?token={{token}}';
                tokenEndpoint = tokenEndpoint.replace("{{token}}",existingCredential.refreshToken);    
                try {
                    const response = await this.httpService.get(tokenEndpoint, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).toPromise();
                    await this.handleRovokeAccess(orgId,existingCredential.id);
                    return {
                        statusCode: 200,
                        message: 'Access token revoked successfully',
                        data: null
                    };
                } catch (error) {
                    throw new BadRequestException(error.response?.data || 'Failed to Revoke access token');
                }
            }
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }

    async handleRovokeAccess(orgId:string,id:string):Promise<void>
    {
        try
        {
            await this.prisma.externalToolCredential.delete({where:{id}});
        }
        catch(err)
        {
            this.logger.error(err);
        }
    }

    async getCalendar(orgId: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async getEvents(orgId: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async getEventById(orgId: string, id: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async addEvent(orgId: string, event: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async updateEvent(orgId: string, id: string, event: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async removeEvent(orgId: string, id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
