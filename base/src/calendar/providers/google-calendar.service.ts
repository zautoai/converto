import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { BaseCalendar } from '../calendar.model';
import { CalendarName } from '../enum/calendar.enum';
import { Token } from '../interface/token.inteface';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { google, Auth } from 'googleapis';
import { GooglEventDto } from '../dto/google.event.dto';

@Injectable()
export class GoogleCalendarService extends BaseCalendar implements OnModuleInit{


    private googleClient: Auth.OAuth2Client;
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

    async onModuleInit() {
        // const calendars = await this.getCalendars('a3ccfcf5-4e1c-43bd-a1c1-1e30c236ca26');
        // const calendar = await this.getCalendar('a3ccfcf5-4e1c-43bd-a1c1-1e30c236ca26','781c5c0a430bb1b48df3d59df73274b7b047589c42ffe3f92abb48d0997474cf@group.calendar.google.com');
        // const events = await this.getEvents('a3ccfcf5-4e1c-43bd-a1c1-1e30c236ca26','781c5c0a430bb1b48df3d59df73274b7b047589c42ffe3f92abb48d0997474cf@group.calendar.google.com');
        // const event = await this.getEventById('a3ccfcf5-4e1c-43bd-a1c1-1e30c236ca26','781c5c0a430bb1b48df3d59df73274b7b047589c42ffe3f92abb48d0997474cf@group.calendar.google.com','3d0v10om2t9q3semomq7n871q4');
        // console.log(event);
        
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
                orgId:orgId,
                toolName: this.calendarName
            }
        })
        if (googleCalendar) {
            await this.prisma.externalToolCredential.update({
                where: {
                    orgId: orgId,
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
                    orgId: orgId,
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
                    orgId,
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

    async getCalendars(orgId: string): Promise<any> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.calendarList.list();
            return response.data;
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }

    async getCalendar(orgId: string, id: string): Promise<any> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.calendars.get({
                calendarId: id,
            })
            return response.data;
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }

    async getEvents(orgId: string,calendarId:string,startDate?:string, endDate?:string): Promise<any> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const hasBothDate = !!(startDate && endDate);
            const selectedDate = this.getStartEndTimesForDay(new Date((!hasBothDate && startDate) ? startDate : new Date())); 
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.list({
                calendarId: calendarId,
                timeMin: hasBothDate ? startDate : selectedDate.timeMin,
                timeMax: hasBothDate ? endDate : selectedDate.timeMax
            });
            return response.data;
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async getEventById(orgId: string, calendarId: string,eventId:string): Promise<any> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.get({
                calendarId,
                eventId
            })
            return response.data;
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async addEvent(orgId: string, calendarId:string, event: GooglEventDto): Promise<any> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.insert({
                calendarId: calendarId,
                requestBody: event
            });
            return response.data;
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async updateEvent(orgId: string,calendarId: string, eventId:string, event: GooglEventDto): Promise<any> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.update({
                calendarId: calendarId,
                requestBody: event
            });
            return response.data;
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async removeEvent(orgId: string,calendarId: string,eventId:string): Promise<void> {
        try
        {
            const accessToken = await this.getAccessToken(orgId);
            if(!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.delete({
                calendarId: calendarId,
                eventId: eventId
            });
        }
        catch(err)
        {
            this.logger.error(err);
            throw new Error(err);
        }
    }
}
