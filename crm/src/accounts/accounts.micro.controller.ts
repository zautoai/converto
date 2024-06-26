import { Controller } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('accounts')
export class AccountsMicroController {
  constructor(private readonly accountService: AccountsService) { }

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
  @MessagePattern({ cmd: 'GET_ACCOUNT_FIELDS' })
  async get_contact_fields(data: { orgId: string }) {
    try {
      return await this.accountService.getAccountFields(data.orgId);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_ABM_ACCOUNTS' })
  async get_abm_accounts(data: any) {
    try {
      return await this.accountService.getAbm(data.orgId, data.filterDto);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_ABM_ACCOUNT' })
  async get_abm_account(data: any) {
    try {
      return await this.accountService.getAbmById(data.orgId, data.id);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({cmd: 'GET_ACCOUNT_COUNT'})
  async get_account_count(data: { orgId: string, startDate: string, endDate: string  }) {
    try {
      return await this.accountService.getAccountCount(data.orgId, data.startDate, data.endDate);
    } catch (error) {
      return error.response || error;
    }
  }
}