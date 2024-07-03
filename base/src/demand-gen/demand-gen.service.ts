import { BadRequestException, Injectable } from '@nestjs/common';
import { generateUniqueId, parseURLParams } from 'src/common/helpers/demand-gen.utils';
import { extractJsonFromMarkdown } from 'src/common/helpers/extractJson.helper';
import { BaseService } from 'src/common/services/base.service';
import { DEMAND_GENT_CAMPAIGN_FINDR_PROMPT } from 'src/common/templates/claude/demand-gen.template';
import { LlmService } from 'src/llm/llm.service';
import { CreateDemandGenDto } from './dto/create-demand-gen.dto';

@Injectable()
export class DemandGenService extends BaseService {

  constructor(
    private readonly llmService: LlmService,
  ) {
    super();
  }


  async create(createDemandGenDto: CreateDemandGenDto) {
    try {
      const orgId = createDemandGenDto.orgId;
      const parsedParams = parseURLParams(createDemandGenDto.url);
      return await this.processCampaign(orgId, parsedParams);
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async processCampaign(orgId: string, parsedParams: any) {
    try {
      parsedParams = this.splitUTMParams(parsedParams);
      if (Object.keys(parsedParams).length <= 0) {
        return null;
      }
      parsedParams['orgId'] = orgId;
      const hash = generateUniqueId(parsedParams);
      const existingCampaign = await this.getExistingCampaign(orgId, hash);
      if (existingCampaign) {
        return existingCampaign;
      }
      const content = JSON.stringify(parsedParams);
      const result = await this.findCampaign(content);
      const jsonResponse = await this.processResultContent(result.content, hash);
      const campaign = await this.createCampaign(orgId, jsonResponse, hash);
      return campaign;
    }
    catch (error) {
      throw error;
    }
  }

  private splitUTMParams(params) {
    const utmParams = {};
    for (const key in params) {
      if (key.startsWith('utm_')) {
        utmParams[key] = params[key];
      }
    }
    return utmParams;
  }

  async getExistingCampaign(orgId: string, hash: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      return await prisma.campaign.findFirst({
        where: {
          hash
        }
      });
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  private processResultContent(content: string, hash: string) {
    let jsonResponse;
    if (content && content.includes('```json')) {
      jsonResponse = extractJsonFromMarkdown(content);
    } else {
      jsonResponse = JSON.parse(content);
    }
    return { ...jsonResponse, hash };
  }

  private async findCampaign(content: string) {
    const promptMessage = [
      { role: 'system', content: DEMAND_GENT_CAMPAIGN_FINDR_PROMPT },
      { role: 'user', content: content }
    ];
    return await this.llmService.chat(promptMessage);
  }

  async createCampaign(orgId: string, jsonResponse: any, hash: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      return await prisma.campaign.create({
        data: {
          title: jsonResponse.title,
          description: jsonResponse.description,
          source: jsonResponse.source,
          hash: hash,
          isPaied: true
        }
      });
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

}
