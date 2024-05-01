import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { CustomFieldParent } from 'src/common/enum/enums';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CreateFieldDto } from 'src/custom-fields/dto/create-fields.dto';
import { EnrichmentService } from 'src/enrichment/enrichment.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';

@Injectable()
export class ContactsService {
  private logger = new Logger(ContactsService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly enrichmentService: EnrichmentService,
    private readonly customFieldsService: CustomFieldsService,
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
    const defaultFields = await this.getTableFields(orgId, 'Contact');

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

    if (contact.email) {
      await this.enrichmentService.enrichContact(orgId, contact.id);
    }

    return {
      code: 201,
      success: true,
      message: 'Contact created successfully',
    };
  }

  async updateContact(orgId: string, id: string, updateContactDto: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const tags = updateContactDto.tags;
    const defaultFields = await this.getTableFields(orgId, 'Contact');
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

    console.log(_customFields);
    console.log(_defaultFields);
    console.log(tags);

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

    return {
      code: 200,
      success: true,
      message: 'Contact updated successfully',
    };
  }

  async deleteContact(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    await this.getContact(orgId, id);
    await prisma.contact.delete({ where: { id } });
    return {
      code: 204,
      success: true,
      message: 'Contact deleted successfully',
    };
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

  async createCustomField(orgId: string, createCustomFieldDto: CreateFieldDto) {
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

  async getCustomFields(orgId: string) {
    const customFields = await this.customFieldsService.getAll(orgId);
    return {
      code: 200,
      message: 'Additional fields fetched successfully',
      data: customFields,
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
    const defaultFields = await this.getTableFields(orgId, 'Contact');
    const _customFields = await this.getCustomFields(orgId);
    const customFields = _customFields.data.map((field) => field.name);
    const fields = [...defaultFields, ...customFields];
    return {
      code: 200,
      message: 'Contact fields fetched successfully',
      data: fields,
    };
  }

  async getTableFields(orgId: string, tableName: string): Promise<string[]> {
    try {
      const prisma = await this.prismaClientManager.getClient(orgId);
      const tableMetadata: any[] = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        AND table_schema = ${orgId};
      `;
      return tableMetadata.map((column) => column.column_name);
    } catch (e) {
      return [];
    }
  }

  convertToKey(name: string) {
    return name.toLowerCase().replaceAll(' ', '_');
  }
}
