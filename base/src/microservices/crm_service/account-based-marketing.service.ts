import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateAccountBasedMaretingDto } from "src/account-based-mareting/dto/create-account-based-mareting.dto";
import { FilterDto } from "src/common/dto/filter.dto";


@Injectable()
export class AccountBasedMarketingMicroService {
  private logger = new Logger(AccountBasedMarketingMicroService.name);

  constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) { }

  async getAccountBasedMarketing(orgId:string,filterDto: FilterDto)
  {
    try {
      return this.CRMClient.send({ cmd: 'GET_ABMS' },{ orgId, filterDto },).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching account based marketing: ${error.message}`);
      return error;
    }
  }

  async getAccountBasedMarketingById(orgId:string, id:string)
  {
    try {
      return this.CRMClient.send({ cmd: 'GET_ABM' }, { orgId, id },).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching account based marketing by id: ${error.message}`);
      return error;
    }
  }

  async createAccountBasedMarketing(orgId:string, createAccountBasedMarketingDto:any)
  {
    try {
      return this.CRMClient.send({ cmd: 'CREATE_ABM' }, { orgId, createAccountBasedMarketingDto },).toPromise();
    } catch (error) {
      this.logger.error(`Error while creating account based marketing: ${error.message}`);
      return error;
    }
  }

  async updateAccountBasedMarketing(orgId:string, id:string, updateAccountBasedMarketingDto:any)
  {
    try {
      return this.CRMClient.send({ cmd: 'UPDATE_ABM' }, { orgId, id, updateAccountBasedMarketingDto },).toPromise();
    } catch (error) {
      this.logger.error(`Error while updating account based marketing: ${error.message}`);
      return error;
    }
  }

  async deleteAccountBasedMarketing(orgId:string, id:string)
  {
    try {
      return this.CRMClient.send({ cmd: 'DELETE_ABM' }, { orgId, id },).toPromise();
    } catch (error) {
      this.logger.error(`Error while deleting account based marketing: ${error.message}`);
      return error;
    }
  }

}