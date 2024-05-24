import { Injectable } from '@nestjs/common';
import { CreateHelperDto } from './dto/create-helper.dto';
import { UpdateHelperDto } from './dto/update-helper.dto';
import { LlmService } from 'src/llm/llm.service';
import { AgentConfig } from 'src/llm/llms/llm.models';
import { ZAUTO_HELPERS } from './entities/helpers.model';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class HelpersService extends BaseService {

  constructor(private llmService: LlmService) {
    super();
  }

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

  async removeById(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const helper = await prisma.openAIAssistant.findUnique({ where: { id } });
      const assistantId = helper.assistantId;
      await this.llmService.deleteAgent(assistantId);
      await prisma.openAIAssistant.delete({ where: { id } });
    } catch (error) {
      console.error(error)
    }
    finally {
      await prisma.$disconnect();
    }
  }

  async remove(orgId: string, id: string, assistantId: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      await prisma.openAIAssistant.delete({ where: { id } });
      await this.llmService.deleteAgent(assistantId);
    } catch (error) {
      console.error(error)
    }
    finally {
      await prisma.$disconnect();
    }
  }

  async removeByName(orgId: string, name: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      await prisma.openAIAssistant.delete({ where: { name } });
    } catch (error) {
      console.error(error)
    }
    finally {
      await prisma.$disconnect();
    }
  }

  async removeByAssistant(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const helper = await prisma.openAIAssistant.findFirst({ where: { assistantId: id } });
      if (helper) {
        const assistantId = helper.assistantId;
        await this.llmService.deleteAgent(id);
        await prisma.openAIAssistant.delete({ where: { id: helper.id } });
      }
    } catch (error) {
      console.error(error)
    } finally {
      await prisma.$disconnect();
    }
  }

  async removeAll(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const helpers = await prisma.openAIAssistant.findMany();
      for (let helper of helpers) {
        await this.llmService.deleteAgent(helper.assistantId);
        await this.remove(orgId, helper.id, helper.assistantId);
      }
    }
    catch (error) {
      console.error(error)
    }
    finally {
      await prisma.$disconnect();
    }
  }

  async findByName(orgId: string, name: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      return await prisma.openAIAssistant.findUnique({ where: { name } });
    } catch (error) {
      console.error(error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async createHelper(orgId: string, agentConf: AgentConfig) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const envName = process.env.NAME;
      let name = agentConf.name
      agentConf.name = envName + '_' + agentConf.name;
      const _assistant = await this.llmService.createAgent(agentConf);
      const helper = await prisma.openAIAssistant.create({
        data: {
          assistantId: _assistant.id,
          name: name,
          description: agentConf.description,
          instructions: agentConf.instructions
        }
      });
      return helper
    } catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }

  async reSyncHelpers(orgId: string) {
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
      await this.removeByName(orgId, helper.name);
      setTimeout(async () => await this.createHelper(orgId, helper), 500);
    }
  }
}
