import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentPromptService } from 'src/agent-prompt/agent-prompt.service';
import { TEMPLATES } from 'src/common/templates/zauto.template';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomeTemplateDto } from './dto/custom-template.dto';
import { SelectTemplateDto } from './dto/select-template.dto';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class PromptTemplateService extends BaseService {

  constructor(
    private readonly agentPromptService: AgentPromptService
  ) {
    super()
  }


  findAll() {
    return TEMPLATES;
  }

  findOne(id: number) {
    const foundTemplate = TEMPLATES.find(template => template.id === id);
    if (!foundTemplate) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return { ...foundTemplate };
  }

  async selectTemplate(orgId: string, selectTemplateDto: SelectTemplateDto) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const agent = await prisma.agent.findFirst();
      if (!agent) {
        throw new NotFoundException(`Agent not found`);
      }
      const template = this.findOne(+selectTemplateDto.templateId);
      template.prompt = this.replaceVariablesInTemplate(template.prompt, selectTemplateDto.variables);
      template.prompt = await this.getAgentPrompt(agent, template.prompt);
      const agentPrompt = await this.agentPromptService.updateByAgent({ orgId, agentId: agent.id, data: { text: template.prompt, type: 'template', templateId: template.id.toString() } });
      return agentPrompt;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async customePrompt(orgId: string, customeTemplateDto: CustomeTemplateDto) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const agent = await prisma.agent.findFirst();
      if (!agent) {
        throw new NotFoundException(`Agent not found`);
      }
      let prompt = customeTemplateDto.prompt;
      prompt = this.replaceVariablesInTemplate(prompt, customeTemplateDto.variables);
      prompt = await this.getAgentPrompt(agent, prompt);
      const agentPrompt = await this.agentPromptService.updateByAgent({ orgId, agentId: agent.id, data: { text: prompt, type: 'custom' } });
      return agentPrompt;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  private replaceVariablesInTemplate(prompt: string, variables: any[]) {
    for (const variable of variables) {
      if (prompt) {
        prompt = prompt.replaceAll(variable.key, variable.value);
      }
    }
    return prompt;
  }

  private async getAgentPrompt(agent, prompt) {
    return await this.agentPromptService.getAssistantPrompt(agent, prompt);
  }

}
