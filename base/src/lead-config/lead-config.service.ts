import { Injectable } from '@nestjs/common';
import { CreateLeadConfigDto } from './dto/create-lead-config.dto';
import { UpdateLeadConfigDto } from './dto/update-lead-config.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class LeadConfigService extends BaseService{

  constructor() {
    super();
  }
  
  async create(serviceParams: ServiceParams<CreateLeadConfigDto>) {
    const { orgId, data: createLeadConfigDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.leadConfig.create({data: createLeadConfigDto});
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const agents = await prisma.leadConfig.findMany({
      skip,
      take: limit,
    });
    const total = await prisma.leadConfig.count();
    return {
      data: agents,
      page: page,
      total: total,
    };
  }

  async findOne(orgId:string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.leadConfig.findFirst({where: {id}});
  }

  async update(serviceParams:ServiceParams<{id: string, updateLeadConfigDto: UpdateLeadConfigDto}>) {
    const { orgId, data: { id, updateLeadConfigDto } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.leadConfig.update({where: {id}, data: updateLeadConfigDto});
  }

  async remove(orgId:string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.leadConfig.delete({where: {id}});
  }
}
