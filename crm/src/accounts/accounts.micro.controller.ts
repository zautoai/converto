import { Controller } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('accounts')
export class AccountsMicroController {
  constructor(private readonly accountService: AccountsService) {}

  @MessagePattern({ cmd: 'CREATE_ACCOUNT' })
  async createAccount(data: any) {
    try {
      return await this.accountService.create(
        data.orgId,
        data.createAccountDto,
      );
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_ACCOUNTS' })
  async getAccounts(data: any) {
    try {
      return await this.accountService.findAll(data.orgId, data.filterDto);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_ACCOUNT' })
  async getAccount(data: any) {
    try {
      return await this.accountService.findOne(data.orgId, data.id);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'UPDATE_ACCOUNT' })
  async updateAccount(data: any) {
    try {
      return await this.accountService.update(
        data.orgId,
        data.id,
        data.updateAccountDto,
      );
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'DELETE_ACCOUNT' })
  async deleteAccount(data: any) {
    try {
      return await this.accountService.remove(data.orgId, data.id);
    } catch (error) {
      return error.response || error;
    }
  }
}
