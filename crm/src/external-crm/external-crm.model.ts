import { Logger } from "@nestjs/common";
import { ICRMConfig } from "./interfaces/appconfig.inteface";

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

    abstract getAuthUrl(additionalInfo:any):string;
    
    abstract getAccessToken(code: string): Promise<any>;

}