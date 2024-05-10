import { Inject, Logger } from "@nestjs/common";
import { ICalendarConfig } from "./interface/calendar-config.interface";
import { Token } from "./interface/token.inteface";
import { AvailabilityScheduleService } from "src/availability-schedule/availability-schedule.service";


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

    abstract getCalendar(orgId:string): Promise<any>;

    abstract getEvents(orgId:string): Promise<any>;

    abstract getEventById(orgId:string, id: string): Promise<any>;

    abstract addEvent(orgId:string, event: any): Promise<any>;

    abstract updateEvent(orgId:string, id:string, event:any): Promise<any>;

    abstract removeEvent(orgId:string, id:string): Promise<void>;
}