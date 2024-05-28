import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateVisitDto } from './dto/create-visit.dto';
import { ServiceParams } from 'src/common/models/service-param.model';
import { BaseService } from 'src/common/services/base.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { IPTrackingService } from 'src/common/services/iptracking.service';

@Injectable()
export class VisitorService extends BaseService {

  constructor(private readonly iptrackingService: IPTrackingService) {
    super();
  }

  async createSession(serviceParams: ServiceParams<{createSessionDto:CreateSessionDto , request: Request}>)
  {
    const { orgId, data: { createSessionDto, request } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try 
    {
      if(!createSessionDto.visitorId)
        {
        const ipAddress = request.headers['x-forwarded-for'] as string;
        const ipData = await this.iptrackingService.getIPData(ipAddress);
        const headers = request.headers;
        delete headers['Authorization']
        delete headers['Proxy-Authorization']
        const visitorObj = {
          infoJson: JSON.stringify(headers),
          userAgent: headers['user-agent'],
          ipAddress: ipAddress,
          trackingInfo: JSON.stringify(ipData)
        };
        const newVisitor = await this.create({orgId,data:visitorObj});
        const newVisit = await this.createOrUpdateVisit({orgId, data: { 
          visitorId: newVisitor.id, 
          source: createSessionDto.source,
          campaignId: createSessionDto.campaignId
        }});
        return {
          visitorId: newVisitor.id,
          visitId: newVisit.id
        }
      }
      else
      {
        const visit = await this.createOrUpdateVisit({orgId, data: { 
          visitorId: createSessionDto.visitorId, 
          source: createSessionDto.source,
          campaignId: createSessionDto.campaignId
        }});
        return {
          visitorId: createSessionDto.visitorId,
          visitId: visit.id
        };
      }
    } 
    catch (err) {
      throw err;
    } 
    finally {
      await this.closeConnection(orgId);
    }
  }

  async create(serviceParams: ServiceParams<CreateVisitorDto>): Promise<any> {
    const { orgId, data: createVisitorDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      return await prisma.visitor.create({ data: createVisitorDto });
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const roleData = await prisma.visitor.findMany({
        skip,
        take: limit,
        include: {
          visits: true
        }
      });
      const total = await prisma.visitor.count();
      return {
        data: roleData,
        page: page,
        total: total
      };
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async findAllByAgent(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    try {
      const roleData = await prisma.visitor.findMany({ skip, take: limit });
      const total = await prisma.visitor.count();
      return {
        data: roleData,
        page: page,
        total: total
      };
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async findAllByOrg(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    try {
      const roleData = await prisma.visitor.findMany({
        skip,
        take: limit,
        orderBy: { modifiedAt: 'desc' },
        include: {
          visits: true
        }
      });
      const total = await prisma.visitor.count();
      return {
        data: roleData,
        page: page,
        total: total
      };
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingVisitor = await prisma.visitor.findUnique({
        where: { id },
        include: {
          visits: {
            select: {
              source: true,
              count: true,
              createdAt: true,
              campaign: true,
            }
          }
        }
      });
      return existingVisitor;
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async findVisit(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingVisit = await prisma.visit.findUnique({ where: { id } });
      if (existingVisit) {
        return existingVisit;
      } else throw new NotFoundException(`Visitor with id ${id} not found.`);
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async findOneByUserAgent(orgId: string, userAgent: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingVisitor = await prisma.visitor.findFirst({ where: { userAgent } });
      if (existingVisitor) {
        return existingVisitor;
      } else throw new NotFoundException(`Visitor with id ${userAgent} not found.`);
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async createOrUpdateByUserAgent(serviceParams: ServiceParams<CreateVisitorDto>) {
    const { orgId, data: createVisitorDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const visitor = await prisma.visitor.findFirst({
        where: {
          userAgent: createVisitorDto.userAgent,
        },
        include: { conversations: true }
      });
      if (visitor) {
        await prisma.visitor.update({
          data: {
            userAgent: createVisitorDto.userAgent,
          },
          where: { id: visitor.id }
        })
        return visitor;
      } else {
        try {
          return await prisma.visitor.create({ data: createVisitorDto });
        } catch (error) {
          console.log(error)
        }
      }
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async update(serviceParams: ServiceParams<UpdateVisitorDto>) {
    const { orgId, data: updateVisitorDto, id } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingVisitor = await prisma.visitor.findUnique({ where: { id } });
      if (existingVisitor) {
        return await prisma.visitor.update({ data: updateVisitorDto, where: { id } });
      } else throw new NotFoundException(`Visitor with id ${id} not found.`);
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingVisitor = await prisma.visitor.findUnique({ where: { id } });
      if (existingVisitor) {
        return await prisma.visitor.delete({ where: { id } })
      } else throw new NotFoundException(`Visitor with id ${id} not found.`);
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }

  async createOrUpdateVisit(serviceParams: ServiceParams<CreateVisitDto>) {
    const { orgId, data: createVisitDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const visit = await prisma.visit.findFirst({
        where: {
          visitorId: createVisitDto.visitorId,
          campaignId: createVisitDto.campaignId,
          source: createVisitDto.source
        }
      });
      if (visit) {
        const count = visit.count + 1;
        return await prisma.visit.update({ data: { count }, where: { id: visit.id } })
      } else {
        return await prisma.visit.create({ data: createVisitDto });
      }
    } catch (err) {
      throw err;
    } finally {
      await this.closeConnection(orgId);
    }
  }
}