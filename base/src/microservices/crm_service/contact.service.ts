import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilterDto } from 'src/common/dto/filter.dto';
import { BaseService } from 'src/common/services/base.service';
import { CreateContactDto } from 'src/crm/dto/create-contacts.dto';

@Injectable()
export class ContactService extends BaseService{

  constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) {
    super();
  }

  async getContacts(orgId: string, filterDto: FilterDto) {
    try {
      return this.CRMClient.send(
        { cmd: 'GET_CONTACTS' },
        { orgId, filterDto },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching contact: ${error.message}`);
      return error;
    }
  }

  async getContact(orgId: string, id: string) {
    try {
      return this.CRMClient.send(
        { cmd: 'GET_CONTACT' },
        { orgId, id },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching contact: ${error.message}`);
      throw error;
    }
  }

  async createContact(orgId: string, createContactDto: any) {
    try {
      return this.CRMClient.send(
        { cmd: 'CREATE_CONTACT' },
        { orgId, createContactDto },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while creating contact: ${error.message}`);
      throw error;
    }
  }

  async updateContact(orgId: string, id: string, updateContactDto: any) {
    try {
      return this.CRMClient.send(
        { cmd: 'UPDATE_CONTACT' },
        { orgId, id, updateContactDto },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while updating contact: ${error.message}`);
      throw error;
    }
  }

  async deleteContact(orgId: string, id: string) {
    try {
      return this.CRMClient.send(
        { cmd: 'DELETE_CONTACT' },
        { orgId, id },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while deleting contact: ${error.message}`);
      throw error;
    }
  }
}
