import { Injectable } from '@nestjs/common';
import { FilterDto } from 'src/common/dto/filter.dto';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { CreateFieldDto } from './dto/create-field.dto';

@Injectable()
export class ContactsService extends BaseService {
  constructor(private readonly contactService: ContactService) {
    super();
  }

  async create(orgId: string, createContactDto: any) {
    return this.handleException(
      await this.contactService.createContact(orgId, createContactDto),
    );
  }

  async findAll(orgId: string, filterDto?: FilterDto) {
    return this.handleException(
      await this.contactService.getContacts(orgId, filterDto),
    );
  }

  async findOne(orgId: string, id: string) {
    return this.handleException(
      await this.contactService.getContact(orgId, id),
    );
  }

  async update(orgId: string, id: string, updateContactDto: any) {
    return this.handleException(
      await this.contactService.updateContact(orgId, id, updateContactDto),
    );
  }

  async remove(orgId: string, id: string) {
    return this.handleException(
      await this.contactService.deleteContact(orgId, id),
    );
  }

  async getContactFields(orgId: string) {
    return this.handleException(
      await this.contactService.getContactFields(orgId),
    );
  }

  async createCustomFields(orgId: string, createFieldDto: CreateFieldDto) {
    return this.handleException(
      await this.contactService.createCustomField(orgId, createFieldDto),
    );
  }

  async getContactsByConversation(orgId: string, id: string) {
    return this.handleException(
      await this.contactService.getContactsByConversation(orgId, id)
    )
  }

  async getContactsByDate(orgId: string, startDate: Date, endDate: Date) {
    return this.handleException(
      await this.contactService.getContactsByDate(orgId, startDate, endDate)
    )
  }
}
