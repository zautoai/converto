import { Injectable } from '@nestjs/common';
import { CreateHelperDto } from './dto/create-helper.dto';
import { UpdateHelperDto } from './dto/update-helper.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LlmService } from 'src/llm/llm.service';
import { AgentConfig } from 'src/llm/llms/llm.models';
import { ZAUTO_HELPERS } from './entities/helpers.model';

@Injectable()
export class HelpersService {

  constructor(private prisma: PrismaService,
    private llmService: LlmService) { }

  create(createHelperDto: CreateHelperDto) {
    return 'This action adds a new helper';
  }

  findAll() {
    return `This action returns all helpers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} helper`;
  }

  update(id: number, updateHelperDto: UpdateHelperDto) {
    return `This action updates a #${id} helper`;
  }

  async removeById(id: string) {
    try {
      const helper = await this.prisma.openAIAssistant.findUnique({ where: { id } });
      const assistantId = helper.assistantId;
      await this.llmService.deleteAgent(assistantId);
      await this.prisma.openAIAssistant.delete({ where: { id } });
    } catch (error) {
      console.error(error)
    }

  }

  async remove(id: string, assistantId: string) {
    try {
      await this.prisma.openAIAssistant.delete({ where: { id } });
      await this.llmService.deleteAgent(assistantId);
    } catch (error) {
      console.error(error)
    }
  }

  async removeByName(name: string) {
    try {
      await this.prisma.openAIAssistant.delete({ where: { name } });
    } catch (error) {
      console.error(error)
    }
  }

  async removeByAssistant(id: string) {

    try {
      const helper = await this.prisma.openAIAssistant.findFirst({ where: { assistantId: id } });
      if (helper) {
        const assistantId = helper.assistantId;
        await this.llmService.deleteAgent(id);
        await this.prisma.openAIAssistant.delete({ where: { id: helper.id } });
      }
    } catch (error) {
      console.error(error)
    }

  }

  async removeAll() {
    const helpers = await this.prisma.openAIAssistant.findMany();
    for (let helper of helpers) {
      await this.llmService.deleteAgent(helper.assistantId);
      await this.remove(helper.id, helper.assistantId);
    }
  }

  async findByName(name: string) {
    try {
      return await this.prisma.openAIAssistant.findUnique({ where: { name } });
    } catch (error) {
      console.error(error);
    }
  }

  async createHelper(agentConf: AgentConfig) {
    try {
      const envName = process.env.NAME;
      let name = agentConf.name
      agentConf.name = envName + '_' + agentConf.name;
      const _assistant = await this.llmService.createAgent(agentConf);
      const helper = await this.prisma.openAIAssistant.create({
        data: {
          assistantId: _assistant.id,
          name: name,
          description: agentConf.description,
          instructions: agentConf.instructions
        }
      });
      return helper
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  async reSyncHelpers() {
    const helpers = ZAUTO_HELPERS;
    const envName = process.env.NAME;
    console.log('Env Name: ' + envName)
    let after = null;
    while (true) {
      const resp = await this.llmService.getAgents(after);
      after = resp?.body?.last_id;
      const _assistants = resp.data;
      if (_assistants.length == 0) {
        break;
      } else {
        for (let assistant of _assistants) {
          if (assistant.name.startsWith(envName + '_')) {
            setTimeout(async () => await this.llmService.deleteAgent(assistant.id), 500);
          }
        }
      }
    }
    for (let helper of helpers) {
      await this.removeByName(helper.name);
      setTimeout(async () => await this.createHelper(helper), 500);
    }
  }
}
