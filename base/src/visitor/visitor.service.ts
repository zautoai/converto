import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateVisitDto } from './dto/create-visit.dto';
import { ServiceParams } from 'src/common/models/service-param.model';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class VisitorService extends BaseService{

  constructor() {
    super();
  }

  async create(serviceParams: ServiceParams<CreateVisitorDto>):Promise<any> {
    const { orgId, data: createVisitorDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.visitor.create({data: createVisitorDto});
  }

  async findAll(serviceParams:ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaClient(orgId);
    const roleData =  await prisma.visitor.findMany({
      skip, 
      take: limit,
      include:{
        visits:true
      } 
    });
    const total = await prisma.visitor.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findAllByAgent(serviceParams:ServiceParams<PaginationDto> ) {
    const { orgId, data: paginationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await prisma.visitor.findMany({skip, take: limit});
    const total = await prisma.visitor.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findAllByOrg(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await prisma.visitor.findMany(
      {
        skip, 
        take: limit, 
        orderBy:{ modifiedAt: 'desc'},
        include:{
          visits:true
        }
      });
    const total = await prisma.visitor.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }


  async findOne(orgId:string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const existingVisitor = await prisma.visitor.findUnique({where: {id},include:{
      visits:{
        select:{
          source:true,
          count:true,
          createdAt:true,
          campaign:true,
        }
      }
    }});
    return existingVisitor;
  }

  async findVisit(orgId:string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const existingVisit = await prisma.visit.findUnique({where: {id}});
    if(existingVisit) {
      return existingVisit;
    } else throw new NotFoundException(`Visitor with id ${id} not found.`);
  }

  async findOneByUserAgent(orgId: string,userAgent: string) {
    const prisma = await this.getPrismaClient(orgId);
    const existingVisitor = await prisma.visitor.findFirst({where: {userAgent}});
    if(existingVisitor) {
      return existingVisitor;
    } else throw new NotFoundException(`Visitor with id ${userAgent} not found.`);
  }

  async createOrUpdateByUserAgent(serviceParams: ServiceParams<CreateVisitorDto>) {
    const { orgId, data: createVisitorDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const visitor = await prisma.visitor.findFirst({
      where: {
        userAgent: createVisitorDto.userAgent,
      }, include: { conversations: true }
    });
    if (visitor) {

      await prisma.visitor.update({
        data: {
          userAgent: createVisitorDto.userAgent,
        }, where: { id: visitor.id }
      })

      return visitor;
    } else {
      try {
        return await prisma.visitor.create({ data: createVisitorDto });
      } catch (error) {
        console.log(error)
      }
    }
  }

  async update(serviceParams:ServiceParams<UpdateVisitorDto>) {
    const { orgId, data: updateVisitorDto, id } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const existingVisitor = await prisma.visitor.findUnique({where: {id}});
    if(existingVisitor) {
      return await prisma.visitor.update({data: updateVisitorDto, where:{id}});
    } else throw new NotFoundException(`Visitor with id ${id} not found.`);
  }

  async remove(orgId:string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const existingVisitor = await prisma.visitor.findUnique({where: {id}});
    if(existingVisitor) {
      return await prisma.visitor.delete({where: {id}})
    } else throw new NotFoundException(`Visitor with id ${id} not found.`);
  }

  async createOrUpdateVisit(serviceParams: ServiceParams<CreateVisitDto>) {
    const { orgId, data: createVisitDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const visit = await prisma.visit.findFirst({
      where: {
        visitorId: createVisitDto.visitorId, 
        campaignId: createVisitDto.campaignId,
        source: createVisitDto.source
        }});
    if(visit) {
      const count = visit.count + 1;
      return await prisma.visit.update({data: {count}, where: {id: visit.id}})
    } else {
      return await prisma.visit.create({data:createVisitDto});
    }
  }
}
