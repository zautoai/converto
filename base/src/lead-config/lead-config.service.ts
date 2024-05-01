import { Injectable } from '@nestjs/common';
import { CreateLeadConfigDto } from './dto/create-lead-config.dto';
import { UpdateLeadConfigDto } from './dto/update-lead-config.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class LeadConfigService {

  constructor(private prisma: PrismaService) {}
  
  async create(createLeadConfigDto: CreateLeadConfigDto) {
    return await this.prisma.leadConfig.create({data: createLeadConfigDto});
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const agents = await this.prisma.leadConfig.findMany({
      skip,
      take: limit,
    });
    const total = await this.prisma.leadConfig.count();
    return {
      data: agents,
      page: page,
      total: total,
    };
  }

  async findByAgent(agentId: string) {
    return await this.prisma.leadConfig.findFirst({where: {agentId}});
  }

  async findOne(id: string) {
    return await this.prisma.leadConfig.findFirst({where: {id}});
  }

  async update(id: string, updateLeadConfigDto: UpdateLeadConfigDto) {
    return await this.prisma.leadConfig.update({where: {id}, data: updateLeadConfigDto});
  }

  async remove(id: string) {
    return await this.prisma.leadConfig.delete({where: {id}});
  }
}
