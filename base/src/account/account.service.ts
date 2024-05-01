import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgAccountDto } from './dto/create-account.dto';
import { UpdateOrgAccountDto } from './dto/update-account.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class OrgAccountService {
  constructor(private prisma: PrismaService) { }

  async create(createOrgAccountDto: CreateOrgAccountDto) {
    try {
      const account = await this.prisma.orgAccount.findUnique({
        where: { orgId: createOrgAccountDto.orgId, subscriptionId: createOrgAccountDto.subscriptionId }
      })
      if (account) {
        return account;
      }
      return await this.prisma.orgAccount.create({
        data: createOrgAccountDto,
      });
    } catch (error) {
      console.log(error)
    }
    
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.orgAccount.findMany({ skip, take: limit });
    const total = await this.prisma.orgAccount.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findOne(orgId: string) {
    const orgAccount = await this.prisma.orgAccount.findUnique({
      where: { orgId },
      include: {
        subscription: true
      }
    });

    if (!orgAccount) {
      throw new NotFoundException(`OrgAccount with orgId "${orgId}" not found`);
    }

    return orgAccount;
  }

  async update(orgId: string, updateOrgAccountDto: UpdateOrgAccountDto) {
    try {
      return await this.prisma.orgAccount.update({
        where: { orgId },
        data: updateOrgAccountDto,
      });
    } catch (error) {
      throw new NotFoundException(`OrgAccount with orgId "${orgId}" not found`);
    }
  }

  async remove(orgId: string) {
    try {
      await this.prisma.orgAccount.delete({
        where: { orgId },
      });
    } catch (error) {
      throw new NotFoundException(`OrgAccount with orgId "${orgId}" not found`);
    }
  }
}
