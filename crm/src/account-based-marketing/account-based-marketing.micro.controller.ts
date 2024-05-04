import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { AccountBasedMarketingService } from "./account-based-marketing.service";


@Controller('account-based-marketing')
export class AccountBasedMarketingMicroserviceController {

    constructor(
        private readonly ambService: AccountBasedMarketingService,
    ) { }

    @MessagePattern({cmd: 'CREATE_ABM'})
    async createAccountBasedMarketing(data: any) {
       try
       {
           return await this.ambService.create(data.orgId, data.createAccountBasedMarketingDto);
       }
       catch (error)
       {
           return error.response || error;
       }
    }

    @MessagePattern({cmd: 'GET_ABM'})
    async getAccountBasedMarketing(data: any) {
        try
        {
            return await this.ambService.findOne(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd: 'GET_ABMS'})
    async getAccountBasedMarketings(data: any) {
        try
        {
            return await this.ambService.findAll(data.orgId);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd: 'UPDATE_ABM'})
    async updateAccountBasedMarketing(data: any) {
        try
        {
            return await this.ambService.update(data.orgId, data.id, data.updateAccountBasedMarketingDto);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd: 'DELETE_ABM'})
    async deleteAccountBasedMarketing(data: any) {
        try
        {
            return await this.ambService.remove(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }
}