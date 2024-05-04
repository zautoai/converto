import { Injectable } from '@nestjs/common';
import { CreateAccountBasedMaretingDto } from './dto/create-account-based-mareting.dto';
import { UpdateAccountBasedMaretingDto } from './dto/update-account-based-mareting.dto';
import { FilterDto } from 'src/common/dto/filter.dto';
import { AccountBasedMarketingMicroService } from 'src/microservices/crm_service/account-based-marketing.service';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class AccountBasedMaretingService extends BaseService{

  constructor(
    private readonly abmService:AccountBasedMarketingMicroService
  ) {
    super();
  }

  async create(orgId: string,createAccountBasedMaretingDto: CreateAccountBasedMaretingDto) {
    return this.handleException(await this.abmService.createAccountBasedMarketing(orgId,createAccountBasedMaretingDto));
  }

  async findAll(orgId: string,filterDto: FilterDto) {
    return this.handleException(await this.abmService.getAccountBasedMarketing(orgId, filterDto));
  }

  async findOne(orgId: string,id: string) {
    return this.handleException(await this.abmService.getAccountBasedMarketingById(orgId, id));
  }

  async update(orgId: string,id: string, updateAccountBasedMaretingDto: UpdateAccountBasedMaretingDto) {
    return this.handleException(await this.abmService.updateAccountBasedMarketing(orgId, id, updateAccountBasedMaretingDto));
  }

  async remove(orgId: string,id: string) {
    return this.handleException(await this.abmService.deleteAccountBasedMarketing(orgId, id));
  }
}
