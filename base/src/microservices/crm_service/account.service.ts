import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { UpdateAccountDto } from 'src/accounts/dto/update-account.dto';
import { FilterDto } from 'src/common/dto/filter.dto';

@Injectable()
export class AccountMicroService {
  private logger = new Logger(AccountMicroService.name);

  constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) {}

  async getAccounts(orgId: string, filterDto: FilterDto) {
    try {
      return this.CRMClient.send(
        { cmd: 'GET_ACCOUNTS' },
        { orgId, filterDto },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching accounts: ${error.message}`);
      throw error;
    }
  }

  async getAccount(orgId: string, accountId: string) {
    try {
      return this.CRMClient.send(
        { cmd: 'GET_ACCOUNT' },
        { orgId, accountId },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching account: ${error.message}`);
      throw error;
    }
  }

  async createAccount(orgId: string, createAccountDto: CreateAccountDto) {
    try {
      return this.CRMClient.send(
        { cmd: 'CREATE_ACCOUNT' },
        { orgId, createAccountDto },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while creating account: ${error.message}`);
      throw error;
    }
  }

  async deleteAccount(orgId: string, id: string) {
    try {
      return this.CRMClient.send(
        { cmd: 'DELETE_ACCOUNT' },
        { orgId, id },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while deleting account: ${error.message}`);
      throw error;
    }
  }

  async updateAccount(
    orgId: string,
    id: string,
    updateAccountDto: UpdateAccountDto,
  ) {
    try {
      return this.CRMClient.send(
        { cmd: 'UPDATE_ACCOUNT' },
        { orgId, id, updateAccountDto },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while updating account: ${error.message}`);
      throw error;
    }
  }
}
