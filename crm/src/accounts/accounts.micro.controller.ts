import { Controller } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller('accounts')
export class AccountsMicroController {

    constructor(
        private readonly accountService: AccountsService
    ) { }

    @MessagePattern({cmd:"CREATE_ACCOUNT"})
    createAccount(data: any) {
        try
        {
            return this.accountService.create(data.orgId,data.account);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"GET_ACCOUNTS"})
    getAccounts(data: any) {
        try
        {
            return this.accountService.findAll(data.orgId,data.filterDto);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"GET_ACCOUNT"})
    getAccount(data: any) {
        try
        {
            return this.accountService.findOne(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"UPDATE_ACCOUNT"})
    updateAccount(data: any) {
        try
        {
            return this.accountService.update(data.orgId, data.id, data.account);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"DELETE_ACCOUNT"})
    deleteAccount(data: any) {
        try
        {
            return this.accountService.remove(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }
}