import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentPromptDto } from './dto/create-agent-prompt.dto';
import { UpdateAgentPromptDto } from './dto/update-agent-prompt.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ASSISTANT_PROMPT_TEMPLATE } from 'src/common/templates/agent-prompt.template';
import { ConversationType } from 'src/common/enums/enums';
import { LlmService } from 'src/llm/llm.service';

@Injectable()
export class AgentPromptService {

  selectQuery = {
    id: true,
    type: true,
    text: true,
    agent: true,
    templateId: true,
    createdAt: true,
    modifiedAt: true
  };

  constructor(private prisma: PrismaService,private readonly llmService: LlmService) { }

  async create(createAgentPromptDto: CreateAgentPromptDto) {
    return await this.prisma.agentPrompt.create({ data: createAgentPromptDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.agentPrompt.findMany({ skip, take: limit, select: this.selectQuery });
    const total = await this.prisma.agentPrompt.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findOne(id: string) {
    const promptData = await this.prisma.agentPrompt.findFirst({
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

  async findByAgent(agentId: string) {
    const promptData = await this.prisma.agentPrompt.findFirst({
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

  async update(id: string, updateAgentPrompt: UpdateAgentPromptDto) {
    const existingPrompt = await this.prisma.agentPrompt.findFirst({ where: { id, } });
    if (existingPrompt) {
      const updatedPrompt = await this.prisma.agentPrompt.update({
        data: updateAgentPrompt, where: {
          id,
        }
      })
      return updatedPrompt;
    } else {
      throw new NotFoundException(`AgentPrompt not found with id ${id}`);
    }
  }

  async updateByAgent(agentId: string, updateAgentPrompt: UpdateAgentPromptDto) {
    const existingPrompt = await this.prisma.agentPrompt.findFirst({ where: { agentId } });
    if (existingPrompt) {
      const updatedPrompt = await this.prisma.agentPrompt.update({
        data: updateAgentPrompt, where: {
          id: existingPrompt.id
        }
      })
      return updatedPrompt;
    } else {
      throw new NotFoundException(`AgentPrompt not found with agentId ${agentId}`);
    }

  }

  async getPromptByOrg(orgId:string)
  {
    const agent = await this.prisma.agent.findFirst({where:{orgId}});
    if(!agent)
    {
      throw new NotFoundException('Agent not found');
    }
    return await this.findByAgent(agent.id);
  }

  async remove(id: string) {
    const existingAgentPrompt = await this.prisma.agentPrompt.findFirst({ where: { id, } });
    console.log(existingAgentPrompt)
    if (existingAgentPrompt) {
      const result = await this.prisma.agentPrompt.delete({
        where: { id },
      })
    } else {
      throw new NotFoundException(`AgentPrompt not found with id ${id}`);
    }
  }

  async getAssistantPrompt(agent: any,template:string = ASSISTANT_PROMPT_TEMPLATE) {
    const convType = agent.conversationType == ConversationType.CALL ? 'Call' : 'Chat';

    let prospectInfo = '';
    if(agent.leadInfo) {
      prospectInfo = ''
      const feilds = agent.leadInfo.split(',')
      for(let [index, field] of feilds.entries()) {
        prospectInfo+=`\n ${index+1}.${field.trim()}`;
      }
    } else {
          prospectInfo += `
          1. Name
          2. Email`;
    }

    const stages = await this.getStagesText(agent.id, prospectInfo)

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

  async getStagesText(agentId: string, leadInfo: string) {
    let stagestext = "";
    const stages = await this.prisma.stage.findMany({ where: { agentId }, orderBy: { sequence: 'asc' } });
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
