import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { CustomFieldParent } from 'src/common/enum/enums';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly customFieldsService: CustomFieldsService,
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

  async update(orgId: string, id: string, updateAccountDto: UpdateAccountDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    await this.findOne(orgId, id);
    const account = await prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
    return {
      code: 200,
      message: 'Account updated successfully',
      data: account,
    };
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    await this.findOne(orgId, id);
    await prisma.account.delete({
      where: { id },
    });
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

}
