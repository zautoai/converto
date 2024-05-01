import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';

@Injectable()
export class AccountsService {

  constructor(
    private readonly prismaClientManager: PrismaClientManager
  ) {}

  async create(orgId:string,createAccountDto: CreateAccountDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const existingAccount = await prisma.account.findFirst({
      where: {
        accountName: createAccountDto.accountName
      }
    });
    if (existingAccount) {
      throw new BadRequestException('Account already exists');
    }
    const account = await prisma.account.create({
      data: createAccountDto
    });
    return {
      code:200,
      message:'Account created successfully',
      data:account
    }
  }

  async findAll(orgId:string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const accounts = await prisma.account.findMany();
    return {
      code:200,
      message:'Accounts fetched successfully',
      data:accounts
    }
  }

  async findOne(orgId:string,id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const account = await prisma.account.findFirst({
      where: {
        id
      }
    });
    return {
      code:200,
      message:'Account fetched successfully',
      data:account
    }
  }

  async update(orgId:string,id: string, updateAccountDto: UpdateAccountDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    await this.findOne(orgId, id);
    const account = await prisma.account.update({
      where: { id },
      data: updateAccountDto
    });
    return {
      code:200,
      message:'Account updated successfully',
      data:account
    }
  }

  async remove(orgId:string,id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    await this.findOne(orgId, id);
    await prisma.account.delete({
      where: { id }
    });
    return {
      code:200,
      message:'Account deleted successfully',
    }
  }
}
