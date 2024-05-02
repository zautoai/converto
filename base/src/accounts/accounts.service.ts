import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FilterDto } from 'src/common/dto/filter.dto';
import { AccountMicroService } from 'src/microservices/crm_service/account.service';

@Injectable()
export class AccountsService {
  constructor(private readonly accountService: AccountMicroService) {}

  async create(orgId: string, createAccountDto: CreateAccountDto) {
    return await this.accountService.createAccount(orgId, createAccountDto);
  }

  async findAll(orgId: string, filterDto: FilterDto) {
    return await this.accountService.getAccounts(orgId, filterDto);
  }

  async findOne(orgId: string, id: string) {
    return await this.accountService.getAccount(orgId, id);
  }

  async update(orgId: string, id: string, updateAccountDto: UpdateAccountDto) {
    return await this.accountService.updateAccount(orgId, id, updateAccountDto);
  }

  async remove(orgId: string, id: string) {
    return await this.accountService.deleteAccount(orgId, id);
  }
}
