import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseCalendar } from '../calendar.model';
import { CalendarName } from '../enum/calendar.enum';
import { Token } from '../interface/token.inteface';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GoogleCalendarService extends BaseCalendar{
    
    constructor(
        private readonly httpService:HttpService
    )
    {
        super({
            name: CalendarName.GOOGLE,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_CALBACK_URI,
            scope: 'profile email https://www.googleapis.com/auth/calendar'
        });
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
    exchangeRefreshTokenForAccessToken(orgId: string, refreshToken: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async handleToken(orgId: string, tokenData: Token): Promise<void> {
    }
    getAccessToken(orgId: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    revokeAccess(orgId: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
