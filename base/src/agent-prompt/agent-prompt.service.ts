import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentPromptDto } from './dto/create-agent-prompt.dto';
import { UpdateAgentPromptDto } from './dto/update-agent-prompt.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ASSISTANT_PROMPT_TEMPLATE } from 'src/common/templates/agent-prompt.template';
import { ConversationType } from 'src/common/enums/enums';
import { LlmService } from 'src/llm/llm.service';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class AgentPromptService extends BaseService {

  selectQuery = {
    id: true,
    type: true,
    text: true,
    agent: true,
    templateId: true,
    createdAt: true,
    modifiedAt: true
  };

  constructor(private readonly llmService: LlmService) {
    super();
  }

  async create(serviceParams: ServiceParams<CreateAgentPromptDto>) {
    const { orgId, data: createAgentPromptDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.agentPrompt.create({ data: createAgentPromptDto });
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaClient(orgId);
    const roleData = await prisma.agentPrompt.findMany({ skip, take: limit, select: this.selectQuery });
    const total = await prisma.agentPrompt.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const promptData = await prisma.agentPrompt.findFirst({
      where: {
        id,
      },
      select: this.selectQuery
    });
    if (promptData) {
      return promptData;
    } else {
      throw new NotFoundException(`AgentPrompt not found with id ${id}`);
    }
  }

  async findByAgent(orgId: string, agentId: string) {
    const prisma = await this.getPrismaClient(orgId);
    const promptData = await prisma.agentPrompt.findFirst({
      where: {
        agentId,
      }, select: this.selectQuery
    });
    if (promptData) {
      return promptData;
    } else {
      throw new NotFoundException(`AgentPrompt not found with id ${agentId}`);
    }
  }

  async update(serviceParams: ServiceParams<UpdateAgentPromptDto>) {
    const { orgId, data: updateAgentPrompt, id } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const existingPrompt = await prisma.agentPrompt.findFirst({ where: { id, } });
    if (existingPrompt) {
      const updatedPrompt = await prisma.agentPrompt.update({
        data: updateAgentPrompt, where: {
          id,
        }
      })
      return updatedPrompt;
    } else {
      throw new NotFoundException(`AgentPrompt not found with id ${id}`);
    }
  }

  async updateByAgent(serviceParams: ServiceParams<UpdateAgentPromptDto>) {
    const { orgId, data: updateAgentPrompt, agentId } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    const existingPrompt = await prisma.agentPrompt.findFirst({ where: { agentId } });
    if (existingPrompt) {
      const updatedPrompt = await prisma.agentPrompt.update({
        data: updateAgentPrompt, where: {
          id: existingPrompt.id
        }
      })
      return updatedPrompt;
    } else {
      throw new NotFoundException(`AgentPrompt not found with agentId ${agentId}`);
    }

  }

  async remove(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const existingAgentPrompt = await prisma.agentPrompt.findFirst({ where: { id, } });
    console.log(existingAgentPrompt)
    if (existingAgentPrompt) {
      const result = await prisma.agentPrompt.delete({
        where: { id },
      })
    } else {
      throw new NotFoundException(`AgentPrompt not found with id ${id}`);
    }
  }

  async getAssistantPrompt(orgId: string, agent: any, template: string = ASSISTANT_PROMPT_TEMPLATE) {
    const convType = agent.conversationType == ConversationType.CALL ? 'Call' : 'Chat';

    let prospectInfo = '';
    if (agent.leadInfo) {
      prospectInfo = ''
      const feilds = agent.leadInfo.split(',')
      for (let [index, field] of feilds.entries()) {
        prospectInfo += `\n ${index + 1}.${field.trim()}`;
      }
    } else {
      prospectInfo += `
          1. Name
          2. Email`;
    }

    const stages = await this.getStagesText(orgId, agent.id, prospectInfo)

    let prompt = template
      .replaceAll('{{agentName}}', agent.displayName)
      .replaceAll('{{agentName}}', agent.displayName)
      .replaceAll('{{agentRole}}', agent.role)
      .replaceAll('{{companyName}}', agent.companyName)
      .replaceAll('{{companyBusiness}}', agent.companyBusiness)
      .replaceAll('{{companyValues}}', agent.companyValue)
      .replaceAll('{{agentPurpose}}', agent.purpouse)
      .replaceAll('{{leadInfo}}', prospectInfo)
      .replaceAll('{{conversationType}}', convType)
      .replaceAll('{{stages}}', stages)
      .replaceAll('"""{{context}}"""', '');
    return prompt;
  }

  async getStagesText(orgId: string, agentId: string, leadInfo: string) {
    const prisma = await this.getPrismaClient(orgId);
    let stagestext = "";
    const stages = await prisma.stage.findMany({ orderBy: { sequence: 'asc' } });
    for (let [index, stage] of stages.entries()) {
      stagestext += `${index + 1}.${stage.name}: ${stage.instruction}\n`;
    }
    stagestext = stagestext.replaceAll("{{leadInfo}}", leadInfo);
    return stagestext;
  }

  async updateAssistent(agent, agentPrompt, agentFile) {
    await this.llmService.updateAgent({
      id: agent.assistantId,
      instructions: agentPrompt.text,
      model: agent.llmModel,
      fileIds: [agentFile.fileId],
      name: agent.displayName
    });
  }
}
