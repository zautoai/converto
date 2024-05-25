import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProspectJurnyDto } from './dto/create-prospect-jurny.dto';
import { UpdateProspectJurnyDto } from './dto/update-prospect-jurny.dto';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class ProspectJurnyService extends BaseService{

  constructor(){
    super();
  }

  async create(serviceParams: ServiceParams<CreateProspectJurnyDto>) {
    const { orgId, data } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try
    {
      const session = await prisma.visit.findUnique({where:{id:data.visitId}});
      if(!session)
      {
        throw new BadRequestException('Invalid session');
      }
      const prospectJurny = await prisma.prospecJurny.create({data});
      return prospectJurny;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async findAll(orgId:string) {
    const prisma = await this.getPrismaClient(orgId);
    try
    {
      const prospectJurnies = await prisma.prospecJurny.findMany();
      return prospectJurnies;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async findOne(orgId:string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try
    {
      const prospectJurny = await prisma.prospecJurny.findUnique({where:{id}});
      return prospectJurny;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async update(serviceParams:ServiceParams<{id: string, updateProspectJurnyDto: UpdateProspectJurnyDto}>) {
    const { orgId, data: {id, updateProspectJurnyDto} } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try
    {
      const prospectJurny = await prisma.prospecJurny.update({where:{id:id},data:updateProspectJurnyDto});
      return prospectJurny;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async remove(orgId: string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try
    {
      const prospectJurny = await prisma.prospecJurny.delete({where:{id:id}});
      return prospectJurny;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }
}
