import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateIntentScoringDto } from './dto/create-intent-scoring.dto';
import { UpdateIntentScoringDto } from './dto/update-intent-scoring.dto';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IntentScoreGeneratorService } from 'src/assistants/services/intentscore-generator.service';
import { ProspectjourneyService } from 'src/prospect-journey/prospect-journey.service';
import { ProspecActivityType } from 'src/prospect-journey/dto/create-prospect-journey.dto';


@Injectable()
export class IntentScoringService extends BaseService implements OnModuleInit{

  constructor(
    private readonly intentScoreGeneratorService:IntentScoreGeneratorService,
    private readonly prospectJourneyService: ProspectjourneyService
  ) {
    super();
  }

  async onModuleInit() {
    // const orgId = 'e8177085-f420-4ced-acb3-99388d2a4e5b';   
    // const visitId = '8ee284fa-7583-4b8c-976b-cdec2b251134'; 
    // const result =  await this.generateIntentScore(orgId, visitId);
    // console.log(result);
  }

  async generateIntentScore(orgId:string,visitId:string):Promise<{positiveScore:number,negativeScore:number,score:number}>
  {
    let _rules = await this.getAll(orgId);
    const rules = _rules.map((rule:any)=> {
      return {
        name:rule.name,
        description: rule.description,
        type: rule.type,
        score: rule.value  
      }
    });
    const _activities = await this.prospectJourneyService.getByVisitId(orgId,visitId);
    const activities = _activities.map((activity:any)=> {
      return {
        type: activity.type,
        data: activity.data,
        url: activity.url,
        ...(activity.type == ProspecActivityType.PAGE_VIEWED) ? {scrollDepth: activity.scrollDepth,timeSpend: activity.timeSpend} : {},
        timeStamp: activity.createdAt
      }
    });
    if(activities.length > 0)
    { 
      try
      {
        const result = await this.intentScoreGeneratorService.getIntentScore(JSON.stringify(rules),JSON.stringify(activities));
        return { 
          positiveScore: result.positiveScore,
          negativeScore: result.negativeScore,
          score: result.score 
        };        
      }
      catch(error)
      {
        console.log(error);
      }
    }
    else
    {
      return { 
        positiveScore: 0,
        negativeScore: 0,
        score: 0 
      };
    }
  }

  async create(serviceParams: ServiceParams<CreateIntentScoringDto>) {
    const { orgId, data } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingIntentScoring = await prisma.intentScoring.findFirst({ where: { name: data.name } });
      if (existingIntentScoring) {
        throw new BadRequestException("Intent Scoring already exists");
      }
      const intentScoring = await prisma.intentScoring.create({ data });
      return intentScoring;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const intentScorings = await prisma.intentScoring.findMany({ skip, take: limit });
      const total = await prisma.intentScoring.count();
      return {
        data: intentScorings,
        page: page,
        total: total
      }
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async getAll(orgId:string)
  {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const intentScorings = await prisma.intentScoring.findMany({
        orderBy: {
          value: 'asc'
        }
      });
      return intentScorings;
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
      const intentScoring = await prisma.intentScoring.findUnique({ where: { id: id } });
      return intentScoring;
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async update(serviceParams: ServiceParams<{ updateIntentScoringDto: UpdateIntentScoringDto, id: string }>) {
    const { orgId, data: { updateIntentScoringDto, id } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      await this.findOne(orgId, id);
      const existingIntentScoring = await prisma.intentScoring.findFirst({
        where: {
          name: updateIntentScoringDto.name,
          id: { not: id }
        }
      });
      if (existingIntentScoring) {
        throw new BadRequestException("Intent Scoring already exists");
      }
      const intentScoring = await prisma.intentScoring.update({ where: { id: id }, data: updateIntentScoringDto });
      return intentScoring;
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
      await this.findOne(orgId, id);
      const intentScoring = await prisma.intentScoring.delete({ where: { id: id } });
      return intentScoring;
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
