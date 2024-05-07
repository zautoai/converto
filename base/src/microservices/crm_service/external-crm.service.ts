import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateCRMMappingsDto } from "src/external-crm/dto/create-crm-mappings.dto";

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

    async getMappings(orgId: string, crmName: string) {
        try {
            this.logger.log(`Getting mappings`)
            return this.CRMClient.send({ cmd: 'GET_MAPPINGS' }, { orgId, crmName }).toPromise()
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

    async getFields(orgId: string, crmName: string) {
        try {
            this.logger.log('Getting Fields')
            return this.CRMClient.send({ cmd: 'GET_FIELDS' }, { orgId, crmName }).toPromise()
        }
        catch (error) {
            this.logger.error('Error in getting fields')
            throw error
        }
    }
}
