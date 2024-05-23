import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Auth, google } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseCalendar } from '../calendar.model';
import { CalendarName } from '../enum/calendar.enum';
import { CalendarEvent } from '../interface/event.interface';
import { Token } from '../interface/token.inteface';
import { PrismaClientManager } from 'src/prisma/prisma-client-manager.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class GoogleCalendarService extends BaseCalendar {

    private googleClient: Auth.OAuth2Client;
    constructor(
        private readonly httpService: HttpService,
        private readonly prismaClientManager: PrismaClientManager
    ) {
        super({
            name: CalendarName.GOOGLE,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_CALBACK_URI,
            scope: 'profile email https://www.googleapis.com/auth/calendar'
        }
        );
    }


    getAuthUrl(additionalInfo: any): string {
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
    async exchangeCodeForAccessToken(serviceParams: ServiceParams<{ code: string }>): Promise<any> {
        const { orgId, data: { code } } = serviceParams
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
            await this.handleToken({ orgId, data: { tokenData: response.data } });
            return {
                statusCode: 200,
                message: 'Access token fetched successfully',
                
                data: null
            };
        } catch (error) {
            throw new BadRequestException(error.response?.data || 'Failed to fetch access token');
        }
    }
    async exchangeRefreshTokenForAccessToken(serviceParams: ServiceParams<{ refreshToken: string }>): Promise<any> {
        const { orgId, data: { refreshToken } } = serviceParams
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
            await this.handleToken({ orgId, data: { tokenData: response.data } });
            return response.data;
        } catch (error) {
            throw new BadRequestException(error.response?.data || 'Failed to fetch access token');
        }
    }

    async handleToken(serviceParams: ServiceParams<{ tokenData: Token }>): Promise<void> {
        const { orgId, data: { tokenData } } = serviceParams
        const prisma = await this.prismaClientManager.getClient(orgId)
        const googleCalendar = await prisma.externalToolCredential.findFirst({
            where: {
                toolName: this.calendarName
            }
        })
        if (googleCalendar) {
            await prisma.externalToolCredential.update({
                where: {
                    id: googleCalendar.id
                },
                data: {
                    ...tokenData.access_token ? { accessToken: tokenData.access_token } : {},
                    ...tokenData.refresh_token ? { refreshToken: tokenData.refresh_token } : {},
                    ...tokenData.expires_in ? { expiresIn: tokenData.expires_in } : {},
                    ...tokenData.token_type ? { tokeType: tokenData.token_type } : {}
                }
            });
        } else {
            await prisma.externalToolCredential.create({
                data: {
                    toolName: this.calendarName,
                    accessToken: tokenData.access_token,
                    refreshToken: tokenData.refresh_token,
                    expiresIn: tokenData.expires_in,
                    ...tokenData.token_type ? { tokeType: tokenData.token_type } : {}
                }
            });
        }
    }

    async getAccessToken(orgId: string): Promise<any> {
        try {
            const prisma = await this.prismaClientManager.getClient(orgId)
            const googleCalendarToken = await prisma.externalToolCredential.findFirst({
                where: {
                    toolName: this.calendarName
                }
            });
            if (!googleCalendarToken) throw new Error('Plugin not connected!.');
            if (this.isTokenExpired(googleCalendarToken.expiresIn, googleCalendarToken.modifiedAt)) {
                const data = await this.exchangeRefreshTokenForAccessToken({ orgId, data: { refreshToken: googleCalendarToken.refreshToken } });
                return data.access_token;
            }
            return googleCalendarToken.accessToken;
        }
        catch (e) {
            this.logger.error(e.message);
            throw new Error(e);
        }
    }
    async revokeAccess(orgId: string): Promise<any> {
        try {
            const prisma = await this.prismaClientManager.getClient(orgId)
            const existingCredential = await prisma.externalToolCredential.findFirst({ where: { toolName: this.calendarName } });
            if (existingCredential) {
                let tokenEndpoint = 'https://accounts.google.com/o/oauth2/revoke?token={{token}}';
                tokenEndpoint = tokenEndpoint.replace("{{token}}", existingCredential.refreshToken);
                try {
                    const response = await this.httpService.get(tokenEndpoint, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).toPromise();
                    await this.handleRovokeAccess({ orgId, data: { id: existingCredential.id } });
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
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }

    async getProfile(orgId: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const oauth2 = google.oauth2({
                auth: this.googleClient,
                version: 'v2'
            });
            const profile = await oauth2.userinfo.get();
            return profile.data;
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    async handleRovokeAccess(serviceParams: ServiceParams<{ id: string }>): Promise<void> {
        try {
            const { orgId, data: { id } } = serviceParams
            const prisma = await this.prismaClientManager.getClient(orgId)

            await prisma.externalToolCredential.delete({ where: { id } });
        }
        catch (err) {
            this.logger.error(err);
        }
    }

    async getCalendars(orgId: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.calendarList.list();
            return response.data.items;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async getCalendar(serviceParams: ServiceParams<{ id: string }>): Promise<any> {
        try {
            const { orgId, data: { id } } = serviceParams;
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
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
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async getEvents(serviceParams: ServiceParams<{ calendarId: string, startDate?: string, endDate?: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarId, startDate, endDate } } = serviceParams;
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
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
            const events = response.data.items;
            const _events = events.map(event => this.formatCalendarEvent(event));
            return _events;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async getEventById(serviceParams: ServiceParams<{ calendarId: string, eventId: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarId, eventId } } = serviceParams;
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.get({
                calendarId,
                eventId
            })
            const event = response.data;
            const _event = event ? this.formatCalendarEvent(event) : null;
            return _event;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async addEvent(serviceParams: ServiceParams<{ calendarId: string, event: CalendarEvent }>): Promise<any> {
        try {
            const { orgId, data: { calendarId, event } } = serviceParams;
            const formattedEvent = this.reverseFormatCalendarEvent(event);
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.insert({
                calendarId: calendarId,
                requestBody: formattedEvent
            });
            return response.data;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async updateEvent(serviceParams: ServiceParams<{ calendarId: string, eventId: string, event: CalendarEvent }>): Promise<any> {
        try {
            const { orgId, data: { calendarId, eventId, event } } = serviceParams;
            const formattedEvent = this.reverseFormatCalendarEvent(event);
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.events.update({
                calendarId: calendarId,
                eventId: eventId,
                requestBody: formattedEvent
            });
            return response.data;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async removeEvent(serviceParams: ServiceParams<{ calendarId: string, eventId: string }>): Promise<void> {
        try {
            const { orgId, data: { calendarId, eventId } } = serviceParams;
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
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
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }

    async getFreeBusy(serviceParams: ServiceParams<{ calendarId: string, startDate: string, endDate: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarId, startDate, endDate } } = serviceParams;
            const accessToken = await this.getAccessToken(orgId);
            if (!accessToken) return null;
            this.googleClient = new google.auth.OAuth2();
            this.googleClient.setCredentials({
                access_token: accessToken,
            });
            const calendar = google.calendar({ version: 'v3', auth: this.googleClient });
            const response = await calendar.freebusy.query({
                requestBody: {
                    timeMin: startDate,
                    timeMax: endDate,
                    items: [{ id: calendarId }]
                }
            });
            return response.data.calendars[calendarId].busy;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }

    formatCalendarEvent(event: any): CalendarEvent {
        const calendarEvent: CalendarEvent = {
            id: event.id,
            title: event.summary,
            description: event.description,
            start: event.start.dateTime,
            end: event.end.dateTime,
            timezone: this.getCurrentTimeZone()
        }
        return calendarEvent;
    }

    reverseFormatCalendarEvent(calendarEvent: CalendarEvent): any {
        const googleEvent: any = {};

        if (calendarEvent.id != null && calendarEvent.id !== '') {
            googleEvent.id = calendarEvent.id;
        }

        if (calendarEvent.title != null && calendarEvent.title !== '') {
            googleEvent.summary = calendarEvent.title;
        }

        if (calendarEvent.description != null && calendarEvent.description !== '') {
            googleEvent.description = calendarEvent.description;
        }

        if (calendarEvent.start != null && calendarEvent.start !== '') {
            googleEvent.start = {
                dateTime: calendarEvent.start,
                timeZone: calendarEvent.timezone
            };
        }

        if (calendarEvent.end != null && calendarEvent.end !== '') {
            googleEvent.end = {
                dateTime: calendarEvent.end,
                timeZone: calendarEvent.timezone
            };
        }

        return googleEvent;
    }

}
