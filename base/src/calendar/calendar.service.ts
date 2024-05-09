import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Token } from './interface/token.inteface';
import { CalendarProvider } from './calendar.provider';

@Injectable()
export class CalendarService {

    constructor(
        private readonly provide: CalendarProvider
    ){}

    getAuthUrl(orgId: string, calendarName:string, additionalInfo: any) {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            const authUrl = calendar.getAuthUrl(orgId,additionalInfo);
            return { authUrl}
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }
    async exchangeCodeForAccessToken(orgId: string, calendarName:string, code: string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.exchangeCodeForAccessToken(orgId,code);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }
    async exchangeRefreshTokenForAccessToken(orgId: string, calendarName:string, refreshToken: string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.exchangeRefreshTokenForAccessToken(orgId,refreshToken);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getAccessToken(orgId: string, calendarName:string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await this.getAccessToken(orgId,calendarName);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }
    async revokeAccess(orgId: string, calendarName:string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.revokeAccess(orgId);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }
}
