import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';
import { TEMPLATES } from 'src/common/templates/zauto.template';
import { SelectTemplateDto } from './dto/select-template.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentPromptService } from 'src/agent-prompt/agent-prompt.service';
import { CustomeTemplateDto } from './dto/custom-template.dto';

@Injectable()
export class PromptTemplateService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly agentPromptService: AgentPromptService
  ) { }


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
    const agent = await this.prisma.agent.findFirst({ where: { orgId } });
    if (!agent) {
      throw new NotFoundException(`Agent not found`);
    }
    const template = this.findOne(+selectTemplateDto.templateId);
    template.prompt = this.replaceVariablesInTemplate(template.prompt, selectTemplateDto.variables);
    template.prompt = await this.getAgentPrompt(agent, template.prompt);
    const agentPrompt = await this.agentPromptService.updateByAgent(agent.id,{text:template.prompt,type:'template',templateId:template.id.toString()});
    return agentPrompt;
  }

  async customePrompt(orgId: string, customeTemplateDto: CustomeTemplateDto)
  {
    const agent = await this.prisma.agent.findFirst({ where: { orgId } });
    if (!agent) {
      throw new NotFoundException(`Agent not found`);
    }
    let prompt = customeTemplateDto.prompt;
    prompt = this.replaceVariablesInTemplate(prompt, customeTemplateDto.variables);
    prompt = await this.getAgentPrompt(agent, prompt);
    const agentPrompt = await this.agentPromptService.updateByAgent(agent.id,{text:prompt,type:'custom'});
    return agentPrompt;
  }

  private replaceVariablesInTemplate(prompt:string, variables:any[]) {
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
