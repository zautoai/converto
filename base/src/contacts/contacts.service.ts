import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { FilterDto } from 'src/common/dto/filter.dto';

@Injectable()
export class ContactsService {

  constructor(
    private readonly contactService: ContactService,
  ) { }

  async create(orgId:string, createContactDto: CreateContactDto) {
    return await this.contactService.createContact(orgId, createContactDto); 
  }

  async findAll(orgId:string,filterDto:FilterDto) {
    return await this.contactService.getContacts(orgId,filterDto);
  }

  async findOne(orgId:string, id: string) {
    return await this.contactService.getContact(orgId, id);
  }

  async update(orgId:string, id: string, updateContactDto: UpdateContactDto) {
    return await this.contactService.updateContact(orgId, id, updateContactDto);
  }

  async remove(orgId:string, id: string) {
    return await this.contactService.deleteContact(orgId, id);
  }
}
