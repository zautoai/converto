import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProspectjourneyDto, ProspecActivityType } from './dto/create-prospect-journey.dto';
import { UpdateProspectjourneyDto } from './dto/update-prospect-journey.dto';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class ProspectjourneyService extends BaseService {

  constructor() {
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

      let prospectjourney = (data.type == ProspecActivityType.PAGE_VIEWED) ? await prisma.prospectJourney.findFirst({ where: { visitId: data.visitId, url: data.url, type: data.type } }) : null;
      if (prospectjourney) {
        if (data.scrollDepth <= prospectjourney.scrollDepth) {
          delete data.scrollDepth;
        }
        prospectjourney = await prisma.prospectJourney.update({ where: { id: prospectjourney.id }, data });
      }
      else {
        prospectjourney = await prisma.prospectJourney.create({ data });
      }
      await this.updateTimeSpend(orgId, data.visitId, prospectjourney.url);

      return prospectjourney;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateTimeSpend(orgId: string, visitId: string, url: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      // Fetch the latest PAGE_VIEWED event
      const pageViewed = await prisma.prospectJourney.findFirst({
        where: { visitId: visitId, url: url, type: ProspecActivityType.PAGE_VIEWED },
        orderBy: { createdAt: 'desc' }
      });

      // Fetch the latest PAGE_CLOSED event
      const pageClosed = await prisma.prospectJourney.findFirst({
        where: { visitId: visitId, url: url, type: ProspecActivityType.PAGE_CLOSED },
        orderBy: { createdAt: 'desc' }
      });
      if (pageViewed && pageClosed) {
        const timeSpend = (pageClosed.createdAt.getTime() - pageViewed.createdAt.getTime());
        await prisma.prospectJourney.update({
          where: { id: pageViewed.id, url: url },
          data: { timeSpend }
        });
      }
    }
    catch (err) {
      throw new BadRequestException(err.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findAll(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const prospectJurnies = await prisma.prospectJourney.findMany();
      return prospectJurnies;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const prospectjourney = await prisma.prospectJourney.findUnique({ where: { id } });
      return prospectjourney;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async update(serviceParams: ServiceParams<{ id: string, updateProspectjourneyDto: UpdateProspectjourneyDto }>) {
    const { orgId, data: { id, updateProspectjourneyDto } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const prospectjourney = await prisma.prospectJourney.update({ where: { id: id }, data: updateProspectjourneyDto });
      return prospectjourney;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const prospectjourney = await prisma.prospectJourney.delete({ where: { id: id } });
      return prospectjourney;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }
}
