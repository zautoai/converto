import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { CustomFieldParent } from 'src/common/enum/enums';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { MappingService } from 'src/common/services/mapping.service';
import { ExternalCrmService } from 'src/external-crm/external-crm.service';
import { ObjectType } from 'src/external-crm/enum/external-crm.enum';
import { EnrichmentProviderName } from 'src/enrichment/enrichment-provider.enum';
import { EnrichmentService } from 'src/enrichment/enrichment.service';

@Injectable()
export class AccountsService {

  private logger = new Logger(AccountsService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly customFieldsService: CustomFieldsService,
    private readonly externalCRMService: ExternalCrmService,
    private readonly mappingService: MappingService,
    private readonly enrichmentService: EnrichmentService
  ) { }

  async create(orgId: string, createAccountDto: CreateAccountDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingAccount = await prisma.account.findFirst({
        where: {
          accountName: createAccountDto.accountName,
        },
      });
      if (existingAccount) {
        throw new BadRequestException('Account already exists');
      }
      const account = await prisma.account.create({
        data: createAccountDto,
      });
      try {
        // push to external crm
        await this.externalCRMService.createCompany(orgId, account);
      }
      catch (err) {
        this.logger.error(err);
      }
      return {
        code: 200,
        message: 'Account created successfully',
        data: account,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async findAll(orgId: string, filterDto: FilterDto) {
    const { page, limit, sort, searchTerm } = filterDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const accounts = await prisma.account.findMany({
        where: {
          ...(searchTerm
            ? {
              OR: [
                { accountName: { contains: searchTerm } },
                { website: { contains: searchTerm } },
                { phone: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { address: { contains: searchTerm } },
                { notes: { contains: searchTerm } },
                { source: { contains: searchTerm } },
                { status: { contains: searchTerm } },
                { industry: { contains: searchTerm } },
              ],
            }
            : {}),
        },
        include: { Contact: true },
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: sort,
        },
      });
      const total = await prisma.account.count({
        where: {
          ...(searchTerm
            ? {
              OR: [
                { accountName: { contains: searchTerm } },
                { website: { contains: searchTerm } },
                { phone: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { address: { contains: searchTerm } },
                { notes: { contains: searchTerm } },
                { source: { contains: searchTerm } },
                { status: { contains: searchTerm } },
                { industry: { contains: searchTerm } },
              ],
            }
            : {}),
        },
      });

      return {
        code: 200,
        message: 'Accounts fetched successfully',
        data: accounts,
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

  async findOne(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const account = await prisma.account.findFirst({
        where: {
          id,
        },
        include: { Contact: true },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }
      return {
        code: 200,
        message: 'Account fetched successfully',
        data: account,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getAccountByDomain(orgId: string, accountName: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const account = await prisma.account.findFirst({
        where: {
          accountName,
        },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      return account;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }


  async update(orgId: string, id: string, updateAccountDto: UpdateAccountDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingAccount = await this.findOne(orgId, id);
      if (!existingAccount.data) {
        throw new NotFoundException('Contact not found');
      }
      await this.findOne(orgId, id);
      const account = await prisma.account.update({
        where: { id },
        data: updateAccountDto,
      });
      // try {
      //   const existingCrmAccount = await this.externalCRMService.getCompanyByName(orgId, existingAccount.data.accountName);
      //   if (existingCrmAccount) {
      //     this.externalCRMService.updateContact(orgId, existingCrmAccount.hs_object_id, updateAccountDto);
      //   }
      // }
      // catch (err) {
      //   this.logger.error(err);
      // }
      return {
        code: 200,
        message: 'Account updated successfully',
        data: account,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingAccount = await this.findOne(orgId, id);
      if (!existingAccount.data) {
        throw new NotFoundException('Contact not found');
      }
      await this.findOne(orgId, id);
      await prisma.account.delete({
        where: { id },
      });
      try {
        const existingCrmAccount = await this.externalCRMService.getCompanyByName(orgId, existingAccount.data.accountName);
        if (existingCrmAccount) {
          await this.externalCRMService.deleteCompany(orgId, existingCrmAccount.hs_object_id);
        }
      }
      catch (err) {
        this.logger.error(err);
      }
      return {
        code: 200,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getAccountFields(orgId: string) {
    const defaultFields = await this.customFieldsService.getTableFields(
      orgId,
      'Account',
    );
    const _customFields = await this.customFieldsService.getAll(
      orgId,
      CustomFieldParent.ACCOUNT,
    );
    const customFields = _customFields.map((field) => field.name);
    const toEliminate = ["id", "parentAccountId", "createdAt", "modifiedAt"];
    let fields = [...defaultFields, ...customFields];
    fields = fields.filter((field) => !toEliminate.includes(field));
    return {
      code: 200,
      message: 'Account fields fetched successfully',
      data: fields,
    };
  }

  async enrichAccountById(orgId: string, domain: string, matchRequest: { [key: string]: string }, provider: string = EnrichmentProviderName.APOLLO,) {
    try {
      this.logger.log(`Enriching account with domain: ${domain}`);
      const existingAccount = await this.getAccountByDomain(orgId, domain);
      const enrichedData = await this.enrichmentService.getOrganization(matchRequest, provider);
      const data = {
        ...(!existingAccount.photoUrl ? { photoUrl: enrichedData.logUrl } : {}),
        ...(!existingAccount.accountName ? { accountName: enrichedData.name } : {}),
        ...(!existingAccount.industry ? { industry: enrichedData.industry } : {}),
        ...(!existingAccount.companySize ? { companySize: +enrichedData.size } : {}),
        ...(!existingAccount.website ? { website: enrichedData.website } : {}),
        ...(!existingAccount.address ? { address: enrichedData.address } : {}),
        ...(!existingAccount.city ? { city: enrichedData.city } : {}),
        ...(!existingAccount.state ? { state: enrichedData.state } : {}),
        ...(!existingAccount.zip ? { zip: enrichedData.zip } : {}),
        ...(!existingAccount.country ? { country: enrichedData.country } : {}),
        ...(!existingAccount.phone ? { phone: enrichedData.phone } : {}),
      };
      await this.update(orgId, existingAccount.id, data);
      return {
        code: 200,
        message: 'Account enriched successfully',
        data: data,
      };
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Error while enriching account',
      );
    }
  }


  async hasMapping(orgId: string): Promise<Boolean> {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const crmName = await this.externalCRMService.getActiveCRM(orgId);
      const contacts = await prisma.crmMapping.count({
        where: {
          crmName,
          objectType: ObjectType.COMPANY
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

  async syncAccountsToExternalCrm(orgId: string) {
    this.logger.debug('Syncing accounts to external CRM');
    try {
      const hasMapping = await this.hasMapping(orgId);
      if (!hasMapping) return;
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const accounts = await this.findAll(orgId, {
          page: page,
          limit: 10,
          searchTerm: '',
          sort: 'asc'
        });

        if (accounts.data && accounts.data.length > 0) {
          for (let account of accounts.data) {
            const existingAccount = await this.externalCRMService.getCompanyByName(orgId, account.accountName);
            const hasPriority = await this.externalCRMService.hasPriority(orgId);
            if (hasPriority) {
              if (existingAccount) {
                try {
                  await this.externalCRMService.updateCompany(orgId, existingAccount.hs_object_id, account);
                }
                catch (e) {
                  this.logger.error(e);
                }
              }
              else {
                try {
                  await this.externalCRMService.createCompany(orgId, account);
                }
                catch (e) {
                  this.logger.error(e);
                }
              }
            }
            else {
              if (existingAccount) continue;
              await this.externalCRMService.createCompany(orgId, account);
            }
            this.logger.log(`Account ${account.accountName} synced to external CRM`);
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

  async syncExternalCrmToAccounts(orgId: string) {

    this.logger.debug('Syncing external CRM to contacts');
    try {
      if (!await this.hasMapping(orgId)) return;
      const accounts = await this.externalCRMService.getCompanies(orgId);
      if (accounts) {
        for (let account of accounts) {
          const existingAccount = await this.getAccountByDomain(orgId, account.name);
          const hasPriority = await this.externalCRMService.hasPriority(orgId);
          const crmName = await this.externalCRMService.getActiveCRM(orgId);
          const mappedData = await this.mappingService.handleReverseMapping(orgId, crmName, ObjectType.COMPANY, account);
          const objects = Object.keys(mappedData);
          if (objects.length === 0) continue;
          if (!hasPriority) {
            if (existingAccount) {
              await this.update(orgId, existingAccount.id, mappedData);
            }
            else {
              await this.create(orgId, mappedData);
            }
          }
          else {
            if (existingAccount) continue;
            await this.create(orgId, mappedData);
          }
          this.logger.log(`Contact ${account.name} synced to external CRM`);
        }
      }
    }
    catch (err) {
      this.logger.error(err);
    }
  }

  async getAbm(orgId: string, filterDto: FilterDto) {
    const { page, limit, sort, searchTerm } = filterDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const abm = await prisma.account.findMany({
        where: {
          ...(searchTerm
            ? {
              OR: [
                { accountName: { contains: searchTerm } },
                { website: { contains: searchTerm } },
                { phone: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { address: { contains: searchTerm } },
                { notes: { contains: searchTerm } },
                { source: { contains: searchTerm } },
                { status: { contains: searchTerm } },
                { industry: { contains: searchTerm } },
              ],
            }
            : {}),
          isabm: true,
        },
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: sort,
        },
      });

      const total = await prisma.account.count({
        where: {
          ...(searchTerm
            ? {
              OR: [
                { accountName: { contains: searchTerm } },
                { website: { contains: searchTerm } },
                { phone: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { address: { contains: searchTerm } },
                { notes: { contains: searchTerm } },
                { source: { contains: searchTerm } },
                { status: { contains: searchTerm } },
                { industry: { contains: searchTerm } },
              ],
            }
            : {}),
          isabm: true,
        }
      })

      return {
        code: 200,
        message: 'ABM fetched successfully',
        data: abm,
        page: page,
        total: total,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error while fetching ABM',
      );
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getAbmById(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const abm = await prisma.account.findUnique({
        where: {
          id,
        },
      });

      return {
        code: 200,
        message: 'ABM fetched successfully',
        data: abm,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getAccountByName(orgId: string, name: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const account = await prisma.account.findFirst({
        where: {
          accountName: name
        }
      })
      return account
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getAccountCount(orgId: string, startDate: string, endDate: string){
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const accountCount = await prisma.account.count({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      });
      return accountCount;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}