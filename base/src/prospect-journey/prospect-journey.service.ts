import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProspectjourneyDto, ProspecActivityType } from './dto/create-prospect-journey.dto';
import { UpdateProspectjourneyDto } from './dto/update-prospect-journey.dto';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class ProspectjourneyService extends BaseService{

  constructor(){
    super();
  }

  async create(serviceParams: ServiceParams<CreateProspectjourneyDto>) {
    const { orgId, data } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const session = await prisma.visit.findUnique({ where: { id: data.visitId } });
      if (!session) {
        throw new BadRequestException('Invalid session');
      }

      let prospectjourney = (data.type == ProspecActivityType.PAGE_VIEWED ) ? await prisma.prospecJourney.findFirst({where: {visitId: data.visitId,url: data.url,type: data.type}}) : null;
      if (prospectjourney) {   
        if(data.scrollDepth <= prospectjourney.scrollDepth)
        {
          delete data.scrollDepth;
        }     
        prospectjourney = await prisma.prospecJourney.update({ where:{id:prospectjourney.id},data });
      }
      else {
        prospectjourney = await prisma.prospecJourney.create({ data });
      }
      await this.updateTimeSpend(orgId, data.visitId,prospectjourney.url);

      return prospectjourney;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async updateTimeSpend(orgId:string, visitId:string, url:string)
  {
    try
    {
      const prisma = await this.getPrismaClient(orgId);
      const firstActvity = await prisma.prospecJourney.findFirst({where: {visitId: visitId, url: url},orderBy: { modifiedAt: 'asc' }});
      const lastActvity = await prisma.prospecJourney.findFirst({where: {visitId: visitId, url: url},orderBy: { modifiedAt: 'desc' }});
      const timeSpend = lastActvity.modifiedAt.getTime() - firstActvity.modifiedAt.getTime();
      const existing = await prisma.prospecJourney.findFirst({where: {visitId: visitId,url: url,type: ProspecActivityType.PAGE_VIEWED}});
      if(existing)
      {
        await prisma.prospecJourney.update({where:{id:existing.id},data:{timeSpend}});
      }
    }
    catch(err)
    {
      throw new BadRequestException(err.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async findAll(orgId:string) {
    const prisma = await this.getPrismaClient(orgId);
    try
    {
      const prospectJurnies = await prisma.prospecJourney.findMany();
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
      const prospectjourney = await prisma.prospecJourney.findUnique({where:{id}});
      return prospectjourney;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async update(serviceParams:ServiceParams<{id: string, updateProspectjourneyDto: UpdateProspectjourneyDto}>) {
    const { orgId, data: {id, updateProspectjourneyDto} } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try
    {
      const prospectjourney = await prisma.prospecJourney.update({where:{id:id},data:updateProspectjourneyDto});
      return prospectjourney;
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
      const prospectjourney = await prisma.prospecJourney.delete({where:{id:id}});
      return prospectjourney;
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
