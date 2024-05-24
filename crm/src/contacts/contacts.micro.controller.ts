import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { CreateFieldDto } from 'src/custom-fields/dto/create-fields.dto';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contacts.dto';

@Controller()
export class ContactMicroserviceController {
  constructor(private contactsService: ContactsService) { }

  @MessagePattern({ cmd: 'GET_CONTACTS' })
  async get_contacts(data: { orgId: string; filterDto: FilterDto }) {
    try {
      return await this.contactsService.getContacts(data.orgId, data.filterDto);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_CONTACT' })
  async get_contact(data: { orgId: string; id: string }) {
    try {
      return await this.contactsService.getContact(data.orgId, data.id);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'CREATE_CONTACT' })
  async create_contact(data: { orgId: string; createContactDto: any }) {
    try {
      try {
        const _createContactDto: CreateContactDto = new CreateContactDto(
          data.createContactDto,
        );
        await _createContactDto.validate();
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      return await this.contactsService.createContact(
        data.orgId,
        data.createContactDto,
      );
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'UPDATE_CONTACT' })
  async update_contact(data: {
    orgId: string;
    id: string;
    updateContactDto: any;
  }) {
    try {
      return await this.contactsService.updateContact(
        data.orgId,
        data.id,
        data.updateContactDto,
      );
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'DELETE_CONTACT' })
  async delete_contact(data: { orgId: string; id: string }) {
    try {
      return await this.contactsService.deleteContact(data.orgId, data.id);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_CONTACT_FIELDS' })
  async get_contact_fields(data: { orgId: string }) {
    try {
      return await this.contactsService.getContactFields(data.orgId);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'CREATE_CUSTOM_FIELD' })
  async create_custom_field(data: {
    orgId: string;
    createFieldDto: CreateFieldDto;
  }) {
    try {
      return await this.contactsService.createCustomField(
        data.orgId,
        data.createFieldDto,
      );
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_CONTACTS_FOR_CONVERSATION' })
  async get_contacts_for_conversation(data: { orgId: string, conversationId: string }) {
    try {
      return await this.contactsService.getContactsByConversation(data.orgId, data.conversationId);
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'GET_CONTACTS_BY_DATE' })
  async get_contacts_by_date(data: { orgId: string, startDate: Date, endDate: Date }) {
    try {
      return await this.contactsService.getContactsByDate(data.orgId, data.startDate, data.endDate);
    } catch (error) {
      return error.response || error;
    }
  }
}
