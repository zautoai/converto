import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountBasedMarketingDto } from './dto/create-account-based-marketing.dto';
import { UpdateAccountBasedMarketingDto } from './dto/update-account-based-marketing.dto';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldParent } from 'src/common/enum/enums';

@Injectable()
export class AccountBasedMarketingService {
  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly customFieldsService: CustomFieldsService,
  ) {}

  async create(orgId: string,createAccountBasedMarketingDto: CreateAccountBasedMarketingDto,) {
    try
    {
      const prisma = await this.prismaClientManager.getClient(orgId);
      await prisma.accountBasedMarketingTarget.create({
        data: createAccountBasedMarketingDto,
      });
      return {
        code: 201,
        success: true,
        message: 'Account Based Marketing created successfully',
      };
    }
    catch(error)
    {
      throw new BadRequestException(error)
    }
  }

  async findAll(orgId: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const data = await prisma.accountBasedMarketingTarget.findMany();
    return {
      code: 200,
      success: true,
      message: 'Account Based Marketing fetched successfully',
      data,
    };
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const data = await prisma.accountBasedMarketingTarget.findUnique({
      where: { id },
    });
    if(!data)
    {
      throw new NotFoundException('Account Based Marketing not found'); 
    }
    return {
      code: 200,
      success: true,
      message: 'Account Based Marketing fetched successfully',
      data,
    };
  }

  async update(orgId: string,id: string,updateAccountBasedMarketingDto: UpdateAccountBasedMarketingDto,) {
    await this.findOne(orgId, id);
    const prisma = await this.prismaClientManager.getClient(orgId);
    await prisma.accountBasedMarketingTarget.update({
      where: { id },
      data: updateAccountBasedMarketingDto,
    });
    return {
      code: 200,
      success: true,
      message: 'Account Based Marketing updated successfully',
    };
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    const prisma = await this.prismaClientManager.getClient(orgId);
    await prisma.accountBasedMarketingTarget.delete({ where: { id } });
    return {
      code: 204,
      success: true,
      message: 'Account Based Marketing deleted successfully',
    };
  }

  async getABMFields(orgId: string) {
    const defaultFields = await this.customFieldsService.getTableFields(
      orgId,
      'Account',
    );
    const _customFields = await this.customFieldsService.getAll(
      orgId,
      CustomFieldParent.ABM,
    );
    const customFields = _customFields.map((field) => field.name);
    const fields = [...defaultFields, ...customFields];
    return {
      code: 200,
      message: 'ABM fields fetched successfully',
      data: fields,
    };
  }
}
