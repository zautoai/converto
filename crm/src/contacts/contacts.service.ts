import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bull';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { CustomFieldParent } from 'src/common/enum/enums';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { EnrichmentService } from 'src/enrichment/enrichment.service';
import { CrmNames } from 'src/external-crm/enum/external-crm.enum';
import { ExternalCrmService } from 'src/external-crm/external-crm.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';


@Injectable()
export class ContactsService {
  private logger = new Logger(ContactsService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly enrichmentService: EnrichmentService,
    private readonly customFieldsService: CustomFieldsService,
    private readonly externalCRMService: ExternalCrmService
  ) {}

  async getContacts(orgId: string, filterDto: FilterDto) {
    const { page, limit, sort, searchTerm } = filterDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(orgId);
    const contacts = await prisma.contact.findMany({
      where: {
        ...(searchTerm
          ? {
              OR: [
                { firstName: { contains: searchTerm } },
                { lastName: { contains: searchTerm } },
                { jobTitle: { contains: searchTerm } },
                { organizationName: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { phone: { contains: searchTerm } },
                { address: { contains: searchTerm } },
                { website: { contains: searchTerm } },
                { notes: { contains: searchTerm } },
                { leadSource: { contains: searchTerm } },
                { status: { contains: searchTerm } },
              ],
            }
          : {}),
      },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: sort,
      },
      include: {
        contactTag: { select: { tag: true } },
        contactCustomFieldValues: {
          select: { value: true, customField: true },
        },
      },
    });
    const transformedContacts = contacts.map((contact) => ({
      ...contact,
      contactTag: contact.contactTag.map((ct) => ct.tag),
    }));
    const total = await prisma.contact.count({
      where: {
        ...(searchTerm
          ? {
              OR: [
                { firstName: { contains: searchTerm } },
                { lastName: { contains: searchTerm } },
                { jobTitle: { contains: searchTerm } },
                { organizationName: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { phone: { contains: searchTerm } },
                { address: { contains: searchTerm } },
                { website: { contains: searchTerm } },
                { notes: { contains: searchTerm } },
                { leadSource: { contains: searchTerm } },
                { status: { contains: searchTerm } },
              ],
            }
          : {}),
      },
      take: limit,
      skip: skip,
    });
    return {
      code: 200,
      success: true,
      message: 'Contacts fetched successfully',
      data: transformedContacts,
      page: page,
      total: total,
    };
  }

  async getContact(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        contactTag: { include: { tag: true } },
        contactCustomFieldValues: {
          select: { value: true, customField: true },
        },
      },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    const transformedContact = {
      ...contact,
      contactTag: contact.contactTag.map((ct) => ct.tag),
    };
    return {
      code: 200,
      success: true,
      message: 'Contact fetched successfully',
      data: transformedContact,
    };
  }

  async createContact(orgId: string, createContactDto: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const defaultFields = await this.customFieldsService.getTableFields(
      orgId,
      'Contact',
    );

    const { _defaultFields, _customFields } = Object.keys(
      createContactDto,
    ).reduce(
      (result, key) => {
        if (defaultFields.includes(key)) {
          result._defaultFields[key] = createContactDto[key];
        } else {
          result._customFields[key] = createContactDto[key];
        }
        return result;
      },
      { _defaultFields: {}, _customFields: {} },
    );
    const existingContact = await this.getContactByEmail(
      orgId,
      createContactDto.email,
    );
    if (existingContact) {
      throw new BadRequestException('Contact already exists');
    }
    const contact = await prisma.contact.create({
      data: {
        ..._defaultFields,
      },
    });

    for (let [key, value] of Object.entries(_customFields)) {
      const _key: string = this.convertToKey(key);

      const existingCustomField = await prisma.customField.findFirst({
        where: {
          key: _key,
          customFieldParent: CustomFieldParent.CONTACT,
        },
      });

      if (!existingCustomField) {
        continue;
      }

      await prisma.contactCustomFieldValue.create({
        data: {
          value: value as string,
          customFieldId: existingCustomField.id,
          contactId: contact.id,
        },
      });
    }

    // enriche
    if (contact.email) {
      await this.enrichmentService.enrichContact(orgId, contact.id);
    }

    try
    {
      // push to external crm
      await this.externalCRMService.createContact(orgId, CrmNames.HUBSPOT, createContactDto);
    }
    catch(err)
    {
      this.logger.error(err);
    }

    return {
      code: 201,
      success: true,
      message: 'Contact created successfully',
    };
  }

  async updateContact(orgId: string, id: string, updateContactDto: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const existingContact = await this.getContact(orgId, id);
    if (!existingContact.data) {
      throw new NotFoundException('Contact not found');
    }
    const tags = updateContactDto.tags;
    const defaultFields = await this.customFieldsService.getTableFields(
      orgId,
      'Contact',
    );
    const { _defaultFields, _customFields } = Object.keys(
      updateContactDto,
    ).reduce(
      (result, key) => {
        if (defaultFields.includes(key)) {
          result._defaultFields[key] = updateContactDto[key];
        } else if (key === 'tags') {
        } else {
          result._customFields[key] = updateContactDto[key];
        }
        return result;
      },
      { _defaultFields: {}, _customFields: {} },
    );

    await prisma.contact.update({
      where: { id },
      data: {
        ..._defaultFields,
      },
    });

    if (tags) {
      for (let tag of tags) {
        await this.mapContactTag(orgId, id, tag);
      }
    }

    for (let [key, value] of Object.entries(_customFields)) {
      const _key: string = this.convertToKey(key);
      const existingCustomField = await prisma.customField.findFirst({
        where: {
          key: _key,
          customFieldParent: CustomFieldParent.CONTACT,
        },
      });

      if (!existingCustomField) {
        continue;
      }

      const existingCustomValue =
        await prisma.contactCustomFieldValue.findFirst({
          where: {
            customFieldId: existingCustomField.id,
            contactId: id,
          },
        });

      if (existingCustomValue) {
        await prisma.contactCustomFieldValue.update({
          where: {
            id: existingCustomValue.id,
          },
          data: {
            value: value as string,
          },
        });
      } else {
        await prisma.contactCustomFieldValue.create({
          data: {
            value: value as string,
            customFieldId: existingCustomField.id,
            contactId: id,
          },
        });
      }
    }

    try
    {
      const existingCrmContact = await this.externalCRMService.getContactByEmail(orgId, CrmNames.HUBSPOT,existingContact.data.email);
      if(existingCrmContact){
        await this.externalCRMService.updateContact(orgId, CrmNames.HUBSPOT, existingCrmContact.hs_object_id, updateContactDto);
      }
    }
    catch(err)
    {
      this.logger.error(err);
    }

    return {
      code: 200,
      success: true,
      message: 'Contact updated successfully',
    };
  }

  async deleteContact(orgId: string, id: string) {
    const existingContact = await this.getContact(orgId, id);
    if (!existingContact.data) {
      throw new NotFoundException('Contact not found');
    }
    const prisma = await this.prismaClientManager.getClient(orgId);
    await this.getContact(orgId, id);
    await prisma.contact.delete({ where: { id } });
    try
    {
      const existingCrmContact = await this.externalCRMService.getContactByEmail(orgId, CrmNames.HUBSPOT,existingContact.data.email);
      if(existingCrmContact){
        await this.externalCRMService.deleteContact(orgId, CrmNames.HUBSPOT, existingCrmContact.hs_object_id);
      }
    }
    catch(err)
    {
      this.logger.error(err);
    }
    return {
      code: 204,
      success: true,
      message: 'Contact deleted successfully',
    };
  }

  async getContactByEmail(orgId: string, email: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const contact = await prisma.contact.findFirst({
      where: { email },
    });
    return contact;
  }

  async getCustomField(orgId: string, id: string) {
    const customField = await this.customFieldsService.get(orgId, id);
    return {
      code: 200,
      success: true,
      message: 'Additional field fetched successfully',
      data: customField,
    };
  }

  async createCustomField(orgId: string, createCustomFieldDto: any) {
    createCustomFieldDto = {
      ...createCustomFieldDto,
      customFieldParent: CustomFieldParent.CONTACT,
    };
    const newField = await this.customFieldsService.create(
      orgId,
      createCustomFieldDto,
    );
    return {
      code: 201,
      message: 'Additional field created successfully',
      data: newField,
    };
  }

  async mapContactTag(orgId: string, contactId: string, tagId: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);

    await prisma.contactTag.create({
      data: {
        contactId,
        tagId,
      },
    });
  }

  async mapCustomFields(orgId: string, contactId: string, field: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    await prisma.contactCustomFieldValue.create({
      data: {
        contactId,
        customFieldId: field.id,
        value: field.value,
      },
    });
  }

  async enrichContact(
    orgId: string,
    contactId: string,
    matchRequest: { [key: string]: string },
  ) {
    try {
      this.logger.log('Enriching contact');
      const response = await this.enrichmentService.enrichPeopleByContact(
        orgId,
        contactId,
        matchRequest,
      );
      this.logger.log('Contact enriched');
    } catch (error) {
      console.error(error);
    }
  }

  async getContactFields(orgId: string) {
    const defaultFields = await this.customFieldsService.getTableFields(
      orgId,
      'Contact',
    );
    const _customFields = await this.customFieldsService.getAll(
      orgId,
      CustomFieldParent.CONTACT,
    );
    const customFields = _customFields.map((field) => field.name);
    const toEliminate = ["id", "createdAt", "modifiedAt"];
    let fields = [...defaultFields, ...customFields];
    fields = fields.filter((field) => !toEliminate.includes(field));
    return {
      code: 200,
      message: 'Contact fields fetched successfully',
      data: fields,
    };
  }

  convertToKey(name: string) {
    return name.toLowerCase().replaceAll(' ', '_');
  }
}
