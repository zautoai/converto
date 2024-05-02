import { Injectable } from '@nestjs/common';
import { FilterDto } from 'src/common/dto/filter.dto';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/microservices/crm_service/contact.service';

@Injectable()
export class ContactsService extends BaseService{

  constructor(private readonly contactService: ContactService) {
    super();
  }

  async create(orgId: string, createContactDto: any) {
    return this.handleException(await this.contactService.createContact(orgId, createContactDto));
  }

  async findAll(orgId: string, filterDto: FilterDto) {
    return this.handleException(await this.contactService.getContacts(orgId, filterDto));
  }

  async findOne(orgId: string, id: string) {
    return this.handleException(await this.contactService.getContact(orgId, id));
  }

  async update(orgId: string, id: string, updateContactDto: any) {
    return this.handleException(await this.contactService.updateContact(orgId, id, updateContactDto));
  }

  async remove(orgId: string, id: string) {
    return this.handleException(await this.contactService.deleteContact(orgId, id));
  }
}
