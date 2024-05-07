import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ExternalCrmService } from './external-crm.service';

@Controller('external-crmmicroservice')
export class ExternalCrmMicroserviceController {

    constructor(
        private readonly externalCrmService: ExternalCrmService
    ){}

    @MessagePattern({ cmd: 'AUTH_URL' })
    async getAuthUrl(data:any) {
        try
        {
            return await this.externalCrmService.getAuthUrl(data.orgId,data.name);
        }
        catch (error) {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'CALLBACK' })
    async callback(data:any) {
        try
        {
            return await this.externalCrmService.exchangeCodeForAccessToken(data.orgId, data.state, data.code);
        }
        catch (error) {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'GET_PROFILE' })
    async getProfile(data:any) {
        try
        {
            return await this.externalCrmService.getProfile(data.orgId, data.crmName);
        }
        catch (error) {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'GET_MAPPINGS' })
    async getMappings(data:any) {
        try
        {
            return await this.externalCrmService.getMappingsByCrmName(data.orgId, data.crmName);
        }
        catch (error) {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'CREATE_MAPPINGS' })
    async createMappings(data:any) {
        try
        {
            return await this.externalCrmService.createMappings(data.orgId, data.createCRMMappingsDto);
        }
        catch (error) {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'GET_CONTACT_FIELDS' })
    async getFields(data:any) {
        try
        {
            return await this.externalCrmService.getContactFields(data.orgId, data.crmName);
        }
        catch (error) {
            return error.response || error;
        }
    }


}
