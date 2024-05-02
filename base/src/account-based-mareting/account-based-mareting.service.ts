import { Injectable } from '@nestjs/common';
import { CreateAccountBasedMaretingDto } from './dto/create-account-based-mareting.dto';
import { UpdateAccountBasedMaretingDto } from './dto/update-account-based-mareting.dto';
import { FilterDto } from 'src/common/dto/filter.dto';
import { AccountBasedMarketingMicroService } from 'src/microservices/crm_service/account-based-marketing.service';

@Injectable()
export class AccountBasedMaretingService {

  constructor(
    private readonly abmService:AccountBasedMarketingMicroService
  ) { }

  async create(orgId: string,createAccountBasedMaretingDto: CreateAccountBasedMaretingDto) {
    return await this.abmService.createAccountBasedMarketing(orgId,createAccountBasedMaretingDto);
  }

  async findAll(orgId: string,filterDto: FilterDto) {
    return await this.abmService.getAccountBasedMarketing(orgId, filterDto);
  }

  async findOne(orgId: string,id: string) {
    return await this.abmService.getAccountBasedMarketingById(orgId, id);
  }

  async update(orgId: string,id: string, updateAccountBasedMaretingDto: UpdateAccountBasedMaretingDto) {
    return await this.abmService.updateAccountBasedMarketing(orgId, id, updateAccountBasedMaretingDto);
  }

  async remove(orgId: string,id: string) {
    return await this.abmService.deleteAccountBasedMarketing(orgId, id);
  }
}
