import { Injectable } from '@nestjs/common';
import { CreateIcpDto } from './dto/create-icp.dto';
import { UpdateIcpDto } from './dto/update-icp.dto';
import { BaseService } from 'src/common/services/base.service';
import { IcpMicroService } from 'src/microservices/crm_service/icp.service';
import { IcpScoreGenerator } from 'src/assistants/services/icp-score-generator.service';
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

@Injectable()
export class IcpService extends BaseService {

  constructor(
    private readonly icpService: IcpMicroService,
    private readonly icpScoreGenerator: IcpScoreGenerator,
    private readonly contactService: ContactService,
    @InjectQueue('icp_score_queue') private readonly icpScoreQueue: Queue,
  ) {
    super();
  }

  async create(orgId: string, createIcpDto: CreateIcpDto) {
    try {
      await this.handleException(
        await this.icpService.createIcp(orgId, createIcpDto),
      );
      await this.addOrUpdateIcpScore(orgId);
    }
    catch (e) {
      console.log(e);
    }
  }

  async findAll(orgId: string) {
    return this.handleException(
      await this.icpService.getIcps(orgId),
    );
  }

  async findOne(orgId: string, id: string) {
    return this.handleException(
      await this.icpService.getIcp(orgId, id),
    );
  }

  async update(orgId: string, id: string, updateIcpDto: UpdateIcpDto) {
    try {
      await this.handleException(
        await this.icpService.updateIcp(orgId, id, updateIcpDto),
      );
      await this.addOrUpdateIcpScore(orgId);

    }
    catch (e) {
      console.log(e);
    }
  }

  async remove(orgId: string, id: string) {
    return this.handleException(
      await this.icpService.deleteIcp(orgId, id),
    );
  }

  async addOrUpdateIcpScore(orgId: string) {
    try {
      const limit = 10;
      const response = (await this.handleException(
        await this.contactService.getContacts(orgId,{limit,page:1}),
      ))
      let contacts=response.data; 
      const total=response.total;
      const totalPage=Math.ceil(total/limit)
      let nextPage=2;
      while(nextPage<=totalPage){
        const _response = (await this.handleException(
          await this.contactService.getContacts(orgId, {limit, page:nextPage}),
        ))
        contacts=contacts.concat(_response.data);
        nextPage++
      }
      for (const contact of contacts) {
        await this.icpScoreQueue.add('icp_score', { orgId, contact });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async calculateIcpScore(orgId: string, contact: any) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const icpList = (await this.icpService.getIcps(orgId)).data
      const formattedIcpList = JSON.stringify(this.transformData(icpList));
      const result = await this.icpScoreGenerator.getIcpScore(JSON.stringify(contact), formattedIcpList);
      const { id, score, category } = result;
      const existingIcpScore = await prisma.icpScore.findFirst({ where: { contactId: contact.id } });
      if (existingIcpScore) {
        const icpScore = await prisma.icpScore.update({ where: { id: existingIcpScore.id }, data: { icpId: id, score, category, contactId: contact.id } });
      }
      else {
        const icpScore = await prisma.icpScore.create({ data: { icpId: id, score, category, contactId: contact.id } });
      }
      return;
    }
    catch (e) {
      console.log(e);
    }
    finally {
      prisma.$disconnect();
      this.closeConnection(orgId)
    }
  }

  transformData(inputData: any) {
    return inputData.map(company => {
      const { id, name, description, score, segment } = company;
      const transformedSegment = segment.map(seg => {
        const { name, description, segmentCategory } = seg;
        const { name: categoryName, description: categoryDescription } = segmentCategory;
        return {
          name,
          description,
          segmentCategory: {
            name: categoryName,
            description: categoryDescription
          }
        };
      });
      return {
        id,
        name,
        description,
        score,
        segment: transformedSegment
      };
    });
  }

}
