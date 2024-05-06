import { Logger } from "@nestjs/common";
import { ICRMConfig } from "./interfaces/appconfig.inteface";
import { Token } from "./interfaces/token.interface";

export abstract class BaseExternalCrm {
    protected readonly logger;
    protected readonly crmName: string;
 
    protected readonly clientId: string;
    protected readonly clientSecret: string; 
    protected readonly redirectUri: string; 
    protected readonly scope: string;

    constructor(config:ICRMConfig)
    {        
        this.crmName = config.name;
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.redirectUri = config.redirectUri;
        this.scope = config.scope;
        const loggerName = `ExternalCrm:${this.crmName}`;
        this.logger = new Logger(loggerName);
        this.logger.log(`Created ${loggerName}`);
    } 

    abstract getAuthUrl(orgId:string,additionalInfo:any):string;
    
    abstract exchangeCodeForAccessToken(orgId:string,code: string): Promise<any>;

    abstract exchangeRefreshTokenForAccessToken(orgId:string, refreshToken: string): Promise<any>;

    abstract handleToken(orgId:string,tokenData: Token): Promise<void>;

    abstract getAccessToken(orgId:string): Promise<any>;

    protected isTokenExpired(expiresIn: number, modifiedAt: Date): boolean {
        const currentTime = Math.floor(Date.now() / 1000);
        const modifiedTime = Math.floor(modifiedAt.getTime() / 1000); 
        const expirationTime = modifiedTime + expiresIn;
        return expirationTime < currentTime;
    }
    // CRM functions
    abstract getProfile(orgId:string): Promise<any>;
    abstract getContactProperties(orgId:string): Promise<any>;
    abstract getContacts(orgId:string): Promise<any>;
    abstract getContact(orgId:string, id:any): Promise<any>;
    abstract createContact(orgId:string, data:any): Promise<any>;
    abstract updateContact(orgId:string, id:any, data:any): Promise<any>;
    abstract deleteContact(orgId:string, id:any): Promise<any>;
    abstract getCompany(orgId: string, id: any): Promise<any>;
    abstract getCompanies(orgId: string): Promise<any>;
    abstract createCompany(orgId: string, data: any): Promise<any>;
    abstract updateCompany(orgId: string, id: any, data: any): Promise<any>;
    abstract deleteCompany(orgId: string, id: any): Promise<any>;
}