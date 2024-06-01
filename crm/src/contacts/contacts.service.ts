import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { CustomFieldParent } from 'src/common/enum/enums';
import { MappingService } from 'src/common/services/mapping.service';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { EnrichmentProviderName } from 'src/enrichment/enrichment-provider.enum';
import { EnrichmentService } from 'src/enrichment/enrichment.service';
import { ObjectType } from 'src/external-crm/enum/external-crm.enum';
import { ExternalCrmService } from 'src/external-crm/external-crm.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';


@Injectable()
export class ContactsService {
  private logger = new Logger(ContactsService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly enrichmentService: EnrichmentService,
    private readonly customFieldsService: CustomFieldsService,
    private readonly externalCRMService: ExternalCrmService,
    private readonly mappingService: MappingService,
    private readonly accountService: AccountsService,
  ) { }

  async getContacts(orgId: string, filterDto: FilterDto) {
    const { page, limit, sort, searchTerm } = filterDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
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
          account: true
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
        }
      });
      return {
        code: 200,
        success: true,
        message: 'Contacts fetched successfully',
        data: transformedContacts,
        page: page,
        total: total,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getContact(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const contact = await prisma.contact.findUnique({
        where: { id },
        include: {
          contactTag: { include: { tag: true } },
          contactCustomFieldValues: {
            select: { value: true, customField: true },
          },
          account: true
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
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async createContact(orgId: string, createContactDto: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
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
      await this.handleAccountContactMap(orgId, contact);

      // enriche
      if (contact.email) {
        await this.enrichmentService.enrichContact(orgId, contact.id);
      }

      try {
        // push to external crm
        await this.externalCRMService.createContact(orgId, createContactDto);
      }
      catch (err) {
        this.logger.error(err);
      }

      return {
        code: 201,
        success: true,
        message: 'Contact created successfully',
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async updateContact(orgId: string, id: string, updateContactDto: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
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

      try {
        const existingCrmContact = await this.externalCRMService.getContactByEmail(orgId, existingContact.data.email);
        if (existingCrmContact) {
          this.externalCRMService.updateContact(orgId, existingCrmContact.hs_object_id, updateContactDto);
        }
      }
      catch (err) {
        this.logger.error(err);
      }

      return {
        code: 200,
        success: true,
        message: 'Contact updated successfully',
        data: updateContactDto,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async deleteContact(orgId: string, id: string) {
    const existingContact = await this.getContact(orgId, id);
    if (!existingContact.data) {
      throw new NotFoundException('Contact not found');
    }
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      await this.getContact(orgId, id);
      await prisma.contact.delete({ where: { id } });
      try {
        const existingCrmContact = await this.externalCRMService.getContactByEmail(orgId, existingContact.data.email);
        if (existingCrmContact) {
          await this.externalCRMService.deleteContact(orgId, existingCrmContact.hs_object_id);
        }
      }
      catch (err) {
        this.logger.error(err);
      }
      return {
        code: 204,
        success: true,
        message: 'Contact deleted successfully',
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getContactByEmail(orgId: string, email: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const contact = await prisma.contact.findFirst({
        where: { email },
      });
      return contact;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
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

    try {
      await prisma.contactTag.create({
        data: {
          contactId,
          tagId,
        },
      });
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async mapCustomFields(orgId: string, contactId: string, field: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      await prisma.contactCustomFieldValue.create({
        data: {
          contactId,
          customFieldId: field.id,
          value: field.value,
        },
      });
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
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

  async enrichPeopleByContact(orgId: string, contactId: string, matchRequest: { [key: string]: string }, provider: string = EnrichmentProviderName.APOLLO,) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      this.logger.log(`Enriching people with contactId: ${contactId}`);
      const enrichedData = await this.enrichmentService.getPeople(matchRequest);
      const existingContact = await prisma.contact.findUnique({
        where: { id: contactId },
      });
      const data = {
        ...(!existingContact.firstName ? { firstName: enrichedData.firstName } : {}),
        ...(!existingContact.lastName ? { lastName: enrichedData.lastName } : {}),
        ...(!existingContact.fullName ? { fullName: enrichedData.fullName } : {}),
        ...(!existingContact.phone ? { phone: enrichedData.phone } : {}),
        ...(!existingContact.address ? { address: enrichedData.address } : {}),
        ...(!existingContact.website ? { website: enrichedData.website } : {}),
        ...(!existingContact.city ? { city: enrichedData.city } : {}),
        ...(!existingContact.state ? { state: enrichedData.state } : {}),
        ...(!existingContact.zip ? { zip: enrichedData.zip } : {}),
        ...(!existingContact.country ? { country: enrichedData.country } : {}),
        ...(!existingContact.organizationName ? { organizationName: enrichedData.organizationName } : {}),
        ...(!existingContact.jobTitle ? { jobTitle: enrichedData.jobTitle } : {}),
        ...(!existingContact.photoUrl ? { photoUrl: enrichedData.photoUrl } : {}),
        ...(!existingContact.socialMedia ? { socialMedia: enrichedData.socialMedia } : {}),
        ...(!existingContact.notes ? { notes: enrichedData.notes } : {}),
      };
      // const enrichedContact = await prisma.contact.update({
      //   where: { id: contactId },
      //   data: {...data},
      // });
      const enrichedContact = (await this.updateContact(orgId, contactId, data)).data;
      await this.handleAccountContactMap(orgId, enrichedContact)
      this.logger.log(`Enriched contact with id: ${enrichedContact.email}`);
      return enrichedContact;
    } catch (error) {
      console.error(error)
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async hasMapping(orgId: string): Promise<Boolean> {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const crmName = await this.externalCRMService.getActiveCRM(orgId);
      const contacts = await prisma.crmMapping.count({
        where: {
          crmName,
          objectType: ObjectType.CONTACT
        }
      });
      return contacts > 0;
    }
    catch (e) {
      return false;
    }
    finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async syncContactsToExternalCrm(orgId: string) {
    this.logger.debug('Syncing contacts to external CRM');
    try {
      if (!await this.hasMapping(orgId)) return;
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const contacts = await this.getContacts(orgId, {
          page: page,
          limit: 10,
          searchTerm: '',
          sort: 'asc'
        });

        if (contacts.data && contacts.data.length > 0) {
          for (let contact of contacts.data) {
            const existingContact = await this.externalCRMService.getContactByEmail(orgId, contact.email);
            const hasPriority = await this.externalCRMService.hasPriority(orgId);
            if (hasPriority) {
              if (existingContact) {
                try {
                  await this.externalCRMService.updateContact(orgId, existingContact.hs_object_id, contact);
                }
                catch (e) {
                  this.logger.error(e);
                }
              }
              else {
                try {
                  await this.externalCRMService.createContact(orgId, contact);
                }
                catch (e) {
                  this.logger.error(e);
                }
              }
            }
            else {
              if (existingContact) continue;
              await this.externalCRMService.createContact(orgId, contact);
            }
            this.logger.log(`Contact ${contact.email} synced to external CRM`);
          }
          page++;
        } else {
          hasNextPage = false;
        }
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  async syncExternalCrmToContacts(orgId: string) {
    this.logger.debug('Syncing external CRM to contacts');
    try {
      if (!await this.hasMapping(orgId)) return;
      const contacts = await this.externalCRMService.getContacts(orgId);
      if (contacts) {
        for (let contact of contacts) {
          const existingContact = await this.getContactByEmail(orgId, contact.email);
          const hasPriority = await this.externalCRMService.hasPriority(orgId);
          const crmName = await this.externalCRMService.getActiveCRM(orgId);
          const mappedData = await this.mappingService.handleReverseMapping(orgId, crmName, ObjectType.CONTACT, contact);
          const objects = Object.keys(mappedData);
          if (objects.length === 0) continue;
          if (!hasPriority) {
            if (existingContact) {
              await this.updateContact(orgId, existingContact.id, mappedData);
            }
            else {
              await this.createContact(orgId, mappedData);
            }
          }
          else {
            if (existingContact) continue;
            await this.createContact(orgId, mappedData);
          }
          this.logger.log(`Contact ${contact.email} synced to external CRM`);
        }
      }
    }
    catch (err) {
      this.logger.error(err);
    }
  }

  async getContactsByConversation(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          conversationId: id
        }
      });
      return contact;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getContactsByDate(orgId: string, startDate: Date, endDate: Date) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          createdAt: {
            gte: startDate.toISOString(),
            lte: endDate.toISOString()
          }
        }
      });
      return contacts;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async handleAccountContactMap(orgId: string, contact: any) {
    if (!contact.organizationName) {
      return
    }
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const accountName = contact.organizationName.trim()
      const existingAccount = await this.accountService.getAccountByName(orgId, accountName);
      if (existingAccount) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { accountId: existingAccount.id },
        });
        return
      }
      const account = await this.accountService.create(orgId, { accountName });
      await prisma.contact.update({
        where: { id: contact.id },
        data: { accountId: account.data.id },
      });
      return
    }
    catch (e) {
      throw e
    }
    finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}
