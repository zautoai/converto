import { Inject, Logger } from "@nestjs/common";
import { ICalendarConfig } from "./interface/calendar-config.interface";
import { Token } from "./interface/token.inteface";
import { AvailabilityScheduleService } from "src/availability-schedule/availability-schedule.service";
import { CalendarEvent } from "./interface/event.interface";


export abstract class BaseCalendar {
    protected readonly logger;
    protected readonly calendarName: string;
 
    protected readonly clientId: string;
    protected readonly clientSecret: string; 
    protected readonly redirectUri: string; 
    protected readonly scope: string;

    constructor(config:ICalendarConfig){
        this.calendarName = config.name;
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.redirectUri = config.redirectUri;
        this.scope = config.scope;
        const loggerName = `Calendar:${this.calendarName}`;
        this.logger = new Logger(loggerName);
        this.logger.log(`Created ${loggerName}`);
    }

    abstract getAuthUrl(orgId:string,additionalInfo:any):string;
    
    abstract exchangeCodeForAccessToken(orgId:string,code: string): Promise<any>;

    abstract exchangeRefreshTokenForAccessToken(orgId:string, refreshToken: string): Promise<any>;

    abstract handleToken(orgId:string,tokenData: Token): Promise<void>;

    abstract getAccessToken(orgId:string): Promise<any>;

    abstract revokeAccess(orgId:string): Promise<any>;

    protected isTokenExpired(expiresIn: number, modifiedAt: Date): boolean {
        const currentTime = Math.floor(Date.now() / 1000);
        const modifiedTime = Math.floor(modifiedAt.getTime() / 1000); 
        const expirationTime = modifiedTime + expiresIn;
        return expirationTime < currentTime;
    }

    protected getStartEndTimesForDay(date: Date): { timeMin: string; timeMax: string } {
        const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const timeMin = new Date(targetDate.setUTCHours(0, 0, 0, 0)).toISOString();
        const timeMax = new Date(targetDate.setUTCHours(23, 59, 59, 999)).toISOString();

        return { timeMin, timeMax };
    }

    abstract getCalendars(orgId:string): Promise<any>;

    abstract getCalendar(orgId:string,id:string): Promise<any>;

    abstract getEvents(orgId:string,calendarId:string,startDate?:string, endDate?:string): Promise<any>;

    abstract getEventById(orgId:string, calendarId: string,eventId:string): Promise<any>;

    abstract addEvent(orgId:string,calendarId:string, event: CalendarEvent): Promise<any>;

    abstract updateEvent(orgId:string,calendarId:string, id:string, event:CalendarEvent): Promise<any>;

    abstract removeEvent(orgId:string,calendarId:string, id:string): Promise<void>;
    abstract getFreeBusy(orgId: string, calendarId: string, startDate: string, endDate: string): Promise<any>;

    getCurrentTimeZone(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}