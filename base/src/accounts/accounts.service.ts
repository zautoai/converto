import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FilterDto } from 'src/common/dto/filter.dto';
import { AccountMicroService } from 'src/microservices/crm_service/account.service';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class AccountsService extends BaseService{
  constructor(private readonly accountService: AccountMicroService) {
    super();
  }

  async create(orgId: string, createAccountDto: CreateAccountDto) {
    return this.handleException(await this.accountService.createAccount(orgId, createAccountDto));
  }

  async findAll(orgId: string, filterDto: FilterDto) {
    return this.handleException(await this.accountService.getAccounts(orgId, filterDto));
  }

  async findOne(orgId: string, id: string) {
    return this.handleException(await this.accountService.getAccount(orgId, id));
  }

  async update(orgId: string, id: string, updateAccountDto: UpdateAccountDto) {
    return this.handleException(await this.accountService.updateAccount(orgId, id, updateAccountDto));
  }

  async remove(orgId: string, id: string) {
    return this.handleException(await this.accountService.deleteAccount(orgId, id));
  }
}
