import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateIntentScoringDto } from './dto/create-intent-scoring.dto';
import { UpdateIntentScoringDto } from './dto/update-intent-scoring.dto';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class IntentScoringService extends BaseService{

  constructor(){
    super();
  }

  async create(serviceParams: ServiceParams<CreateIntentScoringDto>) {
    const { orgId, data } = serviceParams;
    try
    {
      const prisma = await this.getPrismaClient(orgId);
      const existingIntentScoring = await prisma.intentScoring.findFirst({where:{name:data.name}});
      if(existingIntentScoring)
      {
        throw new BadRequestException("Intent Scoring already exists");
      }
      const intentScoring = await prisma.intentScoring.create({data});
      return intentScoring;
    }
    catch(error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data:paginationDto } = serviceParams;
    const { page, limit } = paginationDto;
      const skip = (page - 1) * limit;
    try
    {
      const prisma = await this.getPrismaClient(orgId);
      const intentScorings = await prisma.intentScoring.findMany({ skip, take: limit });
      const total = await prisma.intentScoring.count();
      return {
        data: intentScorings,
        page: page,
        total: total
      }
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
    try
    {
      const prisma = await this.getPrismaClient(orgId);
      const intentScoring = await prisma.intentScoring.findUnique({where:{id:id}});
      return intentScoring;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async update(serviceParams: ServiceParams<{updateIntentScoringDto:UpdateIntentScoringDto, id:string}>) {
    const {orgId, data:{ updateIntentScoringDto, id} } = serviceParams;
    try
    {
      const prisma = await this.getPrismaClient(orgId);
      await this.findOne(orgId,id);
      const existingIntentScoring = await prisma.intentScoring.findFirst({where:{
        name:updateIntentScoringDto.name,
        id:{not:id}
      }
      });
      if(existingIntentScoring)
      {
        throw new BadRequestException("Intent Scoring already exists");
      }
      const intentScoring = await prisma.intentScoring.update({where:{id:id},data:updateIntentScoringDto});
      return intentScoring;
    }
    catch (error)
    {
      throw new BadRequestException(error.message);
    }
    finally {
      await this.closeConnection(orgId);
    }
  }

  async remove(orgId:string,id: string) {
    try
    {
      const prisma = await this.getPrismaClient(orgId);
      await this.findOne(orgId,id);
      const intentScoring = await prisma.intentScoring.delete({where:{id:id}});
      return intentScoring;
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
