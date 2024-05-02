import { Injectable } from '@nestjs/common';
import { FilterDto } from 'src/common/dto/filter.dto';
import { ContactService } from 'src/microservices/crm_service/contact.service';

@Injectable()
export class ContactsService {
  constructor(private readonly contactService: ContactService) {}

  async create(orgId: string, createContactDto: any) {
    return await this.contactService.createContact(orgId, createContactDto);
  }

  async findAll(orgId: string, filterDto: FilterDto) {
    return await this.contactService.getContacts(orgId, filterDto);
  }

  async findOne(orgId: string, id: string) {
    return await this.contactService.getContact(orgId, id);
  }

  async update(orgId: string, id: string, updateContactDto: any) {
    return await this.contactService.updateContact(orgId, id, updateContactDto);
  }

  async remove(orgId: string, id: string) {
    return await this.contactService.deleteContact(orgId, id);
  }
}
