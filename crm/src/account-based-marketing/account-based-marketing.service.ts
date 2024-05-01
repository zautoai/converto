import { Injectable } from '@nestjs/common';
import { CreateAccountBasedMarketingDto } from './dto/create-account-based-marketing.dto';
import { UpdateAccountBasedMarketingDto } from './dto/update-account-based-marketing.dto';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';

@Injectable()
export class AccountBasedMarketingService {
  constructor(private readonly prismaClientManager: PrismaClientManager) {}

  async create(
    orgId: string,
    createAccountBasedMarketingDto: CreateAccountBasedMarketingDto,
  ) {
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
    return {
      code: 200,
      success: true,
      message: 'Account Based Marketing fetched successfully',
      data,
    };
  }

  async update(
    orgId: string,
    id: string,
    updateAccountBasedMarketingDto: UpdateAccountBasedMarketingDto,
  ) {
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
    const prisma = await this.prismaClientManager.getClient(orgId);
    await prisma.accountBasedMarketingTarget.delete({ where: { id } });
    return {
      code: 204,
      success: true,
      message: 'Account Based Marketing deleted successfully',
    };
  }
}
