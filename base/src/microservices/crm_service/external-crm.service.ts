import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateCRMMappingsDto } from "src/external-crm/dto/create-crm-mappings.dto";
import { CRMAuthDto } from "src/external-crm/dto/crm-auth.dto";

@Injectable()
export class ExternalCrmMicroService {

    private logger = new Logger(ExternalCrmMicroService.name);

    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) { }

    async getAuthUrl(orgId: string, name: string) {
        try {
            this.logger.log(`Getting Auth Url`);
            return this.CRMClient.send({ cmd: 'AUTH_URL' }, { orgId, name }).toPromise();
        }
        catch (error) {
            this.logger.error('Error in getting auth url')
            throw error
        }
    }

    async callback(orgId: string, state: string, code: string) {
        try {
            this.logger.log('Callback called');
            return this.CRMClient.send({ cmd: 'CALLBACK' }, { orgId, state, code }).toPromise()
        }
        catch (error) {
            this.logger.error('Error in callback')
            throw error
        }
    }

    async getMappings(orgId: string, crmName: string, objectType: string) {
        try {
            this.logger.log(`Getting mappings`)
            return this.CRMClient.send({ cmd: 'GET_MAPPINGS' }, { orgId, crmName, objectType }).toPromise()
        }
        catch (error) {
            this.logger.error('Error in getting mappings')
            throw error
        }
    }

    async createMappings(orgId: string, createCRMMappingsDto: CreateCRMMappingsDto) {
        try {
            this.logger.log(`Creating mappings`)
            return this.CRMClient.send({ cmd: 'CREATE_MAPPINGS' }, { orgId, createCRMMappingsDto }).toPromise()
        }
        catch (error) {
            this.logger.error('Error in creating mappings')
            throw error
        }
    }

    async getFields(orgId: string, crmName: string, objectType:string) {
        try {
            this.logger.log('Getting Fields')
            return this.CRMClient.send({ cmd: 'GET_CRM_FIELDS' }, { orgId, crmName, objectType }).toPromise()
        }
        catch (error) {
            this.logger.error('Error in getting fields')
            throw error
        }
    }

    async getProfile(orgId: string, crmName: string) {
        try {
            this.logger.log('Getting Profile')
            return this.CRMClient.send({ cmd: 'GET_PROFILE' }, { orgId, crmName }).toPromise()
        }
        catch (error) {
            this.logger.error('Error in getting profile')
            throw error
        }
    }

    async revoke(orgId: string, crmName: string) {
        try {
            this.logger.log('Revoking')
            return this.CRMClient.send({ cmd: 'REVOKE' }, { orgId, crmName }).toPromise()
        }
        catch (error) {
            this.logger.error('Error in revoking')
            throw error
        }
    }
}
