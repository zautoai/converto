import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class AccountsService {

  private logger = new Logger(AccountsService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly customFieldsService: CustomFieldsService,
    private readonly externalCRMService: ExternalCrmService,
    private readonly mappingService: MappingService,
  ) {}

  async create(orgId: string, createAccountDto: CreateAccountDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
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
      await this.externalCRMService.createCompany(orgId,account);
    }
    catch (err) {
      this.logger.error(err);
    }
    return {
      code: 200,
      message: 'Account created successfully',
      data: account,
    };
  }

  async findAll(orgId: string, filterDto: FilterDto) {
    const { page, limit, sort, searchTerm } = filterDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(orgId);
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
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const account = await prisma.account.findFirst({
      where: {
        id,
      },
    });
    console.log(id);

    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return {
      code: 200,
      message: 'Account fetched successfully',
      data: account,
    };
  }

  async getAccountByDomain(orgId: string, accountName: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const account = await prisma.account.findFirst({
      where: {
        accountName,
      },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }
  

  async update(orgId: string, id: string, updateAccountDto: UpdateAccountDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const existingAccount = await this.findOne(orgId, id);
    if (!existingAccount.data) {
      throw new NotFoundException('Contact not found');
    }
    await this.findOne(orgId, id);
    const account = await prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
    try {
      const existingCrmAccount = await this.externalCRMService.getCompanyByName(orgId, existingAccount.data.accountName);
      if (existingCrmAccount) {
        this.externalCRMService.updateContact(orgId, existingCrmAccount.hs_object_id, updateAccountDto);
      }
    }
    catch (err) {
      this.logger.error(err);
    }
    return {
      code: 200,
      message: 'Account updated successfully',
      data: account,
    };
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
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


  async hasMapping(orgId:string):Promise<Boolean>
  {
    try
    {
      const crmName = await this.externalCRMService.getActiveCRM(orgId);
      const prisma = await this.prismaClientManager.getClient(orgId); 
      const contacts = await prisma.crmMapping.count({
        where: { 
          crmName,
          objectType: ObjectType.COMPANY
        }
      });
      return contacts > 0;
    }
    catch(e) 
    {
      return false;
    }
  }

  async syncAccountsToExternalCrm(orgId: string) {
    this.logger.debug('Syncing accounts to external CRM');
    try {
      const hasMapping = await this.hasMapping(orgId);
      if(!hasMapping) return; 
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
            if(hasPriority)
            {
              if(existingAccount) 
              {
                try
                {
                  await this.externalCRMService.updateCompany(orgId, existingAccount.hs_object_id, account);
                }
                catch(e)
                {
                  this.logger.error(e);
                }
              }
              else
              {
                try
                {
                  await this.externalCRMService.createCompany(orgId, account);
                }
                catch(e)
                {
                  this.logger.error(e);
                }
              }
            } 
            else
            {
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
      if(!await this.hasMapping(orgId)) return;
      const accounts = await this.externalCRMService.getCompanies(orgId);
      if (accounts) {
        for (let account of accounts) {
          const existingAccount = await this.getAccountByDomain(orgId, account.name);
          const hasPriority = await this.externalCRMService.hasPriority(orgId);
          const crmName = await this.externalCRMService.getActiveCRM(orgId);
          const mappedData = await this.mappingService.handleReverseMapping(orgId,crmName, ObjectType.COMPANY, account);
          const objects = Object.keys(mappedData); 
          if(objects.length === 0) continue; 
          if(!hasPriority)
          {
            if(existingAccount)
            {
              await this.update(orgId, existingAccount.id, mappedData);
            }
            else
            {
              await this.create(orgId, mappedData);
            }
          }
          else
          {
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

}
