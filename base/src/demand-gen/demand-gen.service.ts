import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateDemandGenDto } from './dto/create-demand-gen.dto';
import { generateUniqueId, parseURLParams } from 'src/common/helpers/demand-gen.utils';
import { LlmService } from 'src/llm/llm.service';
import { extractJsonFromMarkdown } from 'src/common/helpers/extractJson.helper';
import { DEMAND_GENT_CAMPAIGN_FINDR_PROMPT } from 'src/common/templates/demand-gen.template';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientManager } from 'src/prisma/prisma-client-manager.service';

@Injectable()
export class DemandGenService implements OnModuleInit{

  constructor(
    private readonly llmService: LlmService,
    private readonly prisma: PrismaService,
    private readonly prismaClientManager: PrismaClientManager
  ) { }

  async onModuleInit() {
    // const cmpaign = await this.create({
    //   orgId: 'a3ccfcf5-4e1c-43bd-a1c1-1e30c236ca26',
    //   url: 'https://6sense.com/platform/sales/?utm_source=linkedinad&utm_medium=cpc&utm_campaign=baddata&li_fat_id=7bb133b8-978f-473e-abf9-f0c4308bc3c2'
    // })
    // console.log(cmpaign);
    
  }

  async create(createDemandGenDto: CreateDemandGenDto) {
    try {
      const orgId = createDemandGenDto.orgId;
      const parsedParams = parseURLParams(createDemandGenDto.url);
      return await this.processCampaign(orgId,parsedParams);
    }
    catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async processCampaign(orgId:string,parsedParams:any)
  {
    try {
      parsedParams = this.splitUTMParams(parsedParams);
      if(Object.keys(parsedParams).length <= 0)
      {
        return null;
      }
      parsedParams['orgId'] = orgId;
      const hash = generateUniqueId(parsedParams);
      const existingCampaign = await this.getExistingCampaign(hash);
      if (existingCampaign) {
        return existingCampaign;
      }
      const content = JSON.stringify(parsedParams);
      const result = await this.findCampaign(content);
      const jsonResponse = await this.processResultContent(result.content, hash);
      const campaign = await this.createCampaign(orgId, jsonResponse, hash);
      return campaign;
    }
    catch(error)
    {
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

  async getExistingCampaign(hash: string) {
    return await this.prisma.campaign.findFirst({
      where:{
        hash
      }
    });
  }

  private processResultContent(content: string,hash: string) {
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
    const prisma = await this.prismaClientManager.getClient(orgId);
    return await prisma.campaign.create({
      data: {
        title: jsonResponse.title,
        description: jsonResponse.description,
        source: jsonResponse.source,
        hash: hash,
        isPaied: true
      }
    });
  }

}
