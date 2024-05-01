import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateVisitDto } from './dto/create-visit.dto';

@Injectable()
export class VisitorService {

  constructor(private prisma: PrismaService) {}

  async create(createVisitorDto: CreateVisitorDto, orgId: string) {
    return await this.prisma.visitor.create({data: {...createVisitorDto, orgId}});
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await this.prisma.visitor.findMany({
      skip, 
      take: limit,
      include:{
        visits:true
      } 
    });
    const total = await this.prisma.visitor.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findAllByAgent(agentId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await this.prisma.visitor.findMany({skip, take: limit, where: {agentId} });
    const total = await this.prisma.visitor.count({where: {agentId}});
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findAllByOrg(orgId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await this.prisma.visitor.findMany(
      {
        skip, 
        take: limit, 
        where: {orgId},
        orderBy:{ modifiedAt: 'desc'},
        include:{
          visits:true
        }
      });
    const total = await this.prisma.visitor.count({where: {orgId}});
    return {
      data: roleData,
      page: page,
      total: total
    };
  }


  async findOne(id: string) {
    const existingVisitor = await this.prisma.visitor.findUnique({where: {id},include:{
      visits:{
        select:{
          source:true,
          count:true,
          createdAt:true,
          campaign:true,
        }
      }
    }});
    if(existingVisitor) {
      return existingVisitor;
    } else throw new NotFoundException(`Visitor with id ${id} not found.`);
  }

  async findById(id: string) {
    if(id) {
      const existingVisitor = await this.prisma.visitor.findUnique({where: {id}});
      if(existingVisitor) {
        return existingVisitor;
      } else null;
    } else {
      return null;
    }
    
  }

  async findVisit(id: string) {
    const existingVisit = await this.prisma.visit.findUnique({where: {id}});
    if(existingVisit) {
      return existingVisit;
    } else throw new NotFoundException(`Visitor with id ${id} not found.`);
  }

  async findOneByUserAgent(userAgent: string) {
    const existingVisitor = await this.prisma.visitor.findFirst({where: {userAgent}});
    if(existingVisitor) {
      return existingVisitor;
    } else throw new NotFoundException(`Visitor with id ${userAgent} not found.`);
  }

  async createOrUpdateByUserAgent(createVisitorDto: CreateVisitorDto) {
    const visitor = await this.prisma.visitor.findFirst({
      where: {
        agentId: createVisitorDto.agentId, 
        userAgent: createVisitorDto.userAgent, 
      }, include: {conversations: true}});
    if(visitor) {
      
      await this.prisma.visitor.update({data: {
        userAgent: createVisitorDto.userAgent,
      }, where:{id: visitor.id}})

      return visitor;
    } else {
      try {
        return await this.prisma.visitor.create({data: createVisitorDto});
      } catch(error) {
        console.log(error)
      }
    }
  }

  async update(id: string, updateVisitorDto: UpdateVisitorDto) {
    const existingVisitor = await this.prisma.visitor.findUnique({where: {id}});
    if(existingVisitor) {
      return await this.prisma.visitor.update({data: updateVisitorDto, where:{id}});
    } else throw new NotFoundException(`Visitor with id ${id} not found.`);
  }

  async remove(id: string) {
    const existingVisitor = await this.prisma.visitor.findUnique({where: {id}});
    if(existingVisitor) {
      return await this.prisma.visitor.delete({where: {id}})
    } else throw new NotFoundException(`Visitor with id ${id} not found.`);
  }

  async createOrUpdateVisit(createVisitDto: CreateVisitDto) {
    const visit = await this.prisma.visit.findFirst({
      where: {
        visitorId: createVisitDto.visitorId, 
        campaignId: createVisitDto.campaignId,
        source: createVisitDto.source,
        agentId: createVisitDto.agentId}});
    if(visit) {
      const count = visit.count + 1;
      return await this.prisma.visit.update({data: {count}, where: {id: visit.id}})
    } else {
      return await this.prisma.visit.create({data:createVisitDto});
    }
  }
}
