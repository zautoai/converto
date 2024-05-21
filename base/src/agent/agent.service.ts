import { ConflictException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AgentPromptService } from 'src/agent-prompt/agent-prompt.service';
import { ChromaDBService } from 'src/chroma/chroma-dbservice/chroma-db.service';
import { StaticFileService } from 'src/common/services/static.service';
import { Agent, AgentStatus } from './entities/agent.entity';
import { S3Service } from 'src/common/services/s3.service';
import { FileUtilService } from 'src/common/services/file-utility.service';
import { LlmService } from 'src/llm/llm.service';
import { StageService } from 'src/stage/stage.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
const { minify } = require('uglify-js');
import * as fs from 'fs';
import * as path from 'path';
import { DemandGenService } from 'src/demand-gen/demand-gen.service';
import { PrismaClientManager } from 'src/prisma/prisma-client-manager.service';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';

@Injectable()
export class AgentService {

  constructor(
    private readonly promptService: AgentPromptService,
    private readonly chroma: ChromaDBService,
    private readonly staticFileService: StaticFileService,
    private fileService: FileUtilService,
    private readonly s3Service: S3Service,
    private readonly llmService: LlmService,
    private readonly stageService: StageService,
    private readonly prismaClientManager: PrismaClientManager
  ) { }


  getWelcomeMessage(agent: any) {
    const message = `Hello! 👋 I'm ${agent.displayName} from ${agent.companyName}, How can I help you?`;
    return message;
  }

  async createOpenAIAssistant(agent: Agent, fileId?: string) {
    const assistant = await this.llmService.createAgent({
      name: agent.displayName,
      model: agent.llmModel,
      instructions: await this.promptService.getAssistantPrompt(agent),
      fileIds: [fileId]
    });
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);//need to replace with actual org id
    await prisma.agent.update({
      data: {
        assistantId: assistant.id,
      }, where: { id: agent.id }
    });
  }

  async create(createAgentDto: CreateAgentDto, fileId?: string) {
    const isExist = await this.isNameExists(createAgentDto.name);

    //Default UseAssistant for all avatar
    createAgentDto.useAssistant = true;
    const useAssistant = createAgentDto.useAssistant;

    //Default LLM Model for all avatar
    createAgentDto.llmModel = process.env.OPENAI_ASSISTANT_DEFAULT_MODEL;

    if (isExist) {
      throw new ConflictException('Agent name alread taken.')
    } else {
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      createAgentDto.welcomeMsg = this.getWelcomeMessage({ ...createAgentDto });
      const agent = await prisma.agent.create({ data: createAgentDto });
      setImmediate(async () => {
        const instruction = await this.promptService.getAssistantPrompt(agent);
        await this.chroma.createNameSapce(agent.name);
        await this.promptService.create({ agentId: agent.id, type: 'system', text: instruction });
        //Create Default stages for agent
        if (agent) {
          await this.stageService.setDefaultStages(agent);
        }

        //create file if fileId found
        if (fileId) {
          await prisma.agentFile.create({
            data: {
              agentId: agent.id,
              fileId: fileId
            }
          });
        }
      })

      return agent;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agents = await prisma.agent.findMany({
      skip,
      take: limit, where: { status: { not: AgentStatus.DELETED } }
    });
    const total = await prisma.agent.count();
    return {
      data: agents,
      page: page,
      total: total,
    };
  }

  async findAllByOrg(paginationDto: PaginationDto, orgId: string) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(orgId);
    const agents = await prisma.agent.findMany({
      skip,
      take: limit,
      where: { orgId, status: { not: AgentStatus.DELETED } }
    });
    const total = await prisma.agent.count();
    return {
      data: agents,
      page: page,
      total: total,
    };
  }

  async findOne(id: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({
      where: { id },
    });
    if (agent) {
      return agent;
    } else {
      throw new NotFoundException(`Agent not found with id ${id}`);
    }
  }

  async findOneByOrg(orgId: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({
      where: { orgId },
    });
    if (agent) {
      return agent;
    } else {
      return null;
    }
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    const welcomeMsg = this.getWelcomeMessage({ ...updateAgentDto });
    updateAgentDto.welcomeMsg = welcomeMsg;
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({
      where: { id },
    });
    if (agent) {
      const updatedAgent = await prisma.agent.update({
        data: updateAgentDto,
        where: { id },
      });
      const agentPrompt = await this.promptService.updateByAgent(agent.id, { type: 'system', text: await this.promptService.getAssistantPrompt(updatedAgent) });
      const agentFile = await prisma.agentFile.findFirst({
        where: {
          agentId: agent.id
        }
      })
      await this.promptService.updateAssistent(agent, agentPrompt, agentFile);
      return updatedAgent;
      // await this.llmService.updateAgent({
      //   id: agent.assistantId,
      //   instructions: agentPrompt.text,
      //   model: agent.llmModel,
      //   fileIds: [agentFile.id], 
      //   name: agent.displayName
      // });
    } else {
      throw new NotFoundException(`Agent not found with id ${id}`);
    }
  }

  async updateStyles(id: string, styledata: any) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({
      where: { id },
    });
    if (agent) {
      const data = {
        ...styledata.styles ? { styles: styledata.styles } : {},
        ...styledata.wakeupTime ? { wakeupTime: styledata.wakeupTime } : {},
        ...styledata.position ? { position: styledata.position } : {},
      }
      const updatedAgent = await prisma.agent.update({
        data: data,
        where: { id },
      });
    } else {
      throw new NotFoundException(`Agent not found with id ${id}`);
    }
  }

  async updateLeadInfo(id: string, leadInfo: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({
      where: { id },
    });
    if (agent) {
      const updatedAgent = await prisma.agent.update({
        data: { leadInfo },
        where: { id },
      });

      const agentPrompt = await this.promptService.updateByAgent(agent.id, { type: 'system', text: await this.promptService.getAssistantPrompt(updatedAgent) });
      const agentFile = await prisma.agentFile.findFirst({
        where: {
          agentId: agent.id
        }
      })
      await this.promptService.updateAssistent(agent, agentPrompt, agentFile);
      return updatedAgent;
    } else {
      throw new NotFoundException(`Agent not found with id ${id}`);
    }
  }

  async updateStatus(id: string, status: AgentStatus) {
    try {
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      prisma.agent.update({ data: { status }, where: { id } });
    } catch (error) {
      console.log(error)
    }
  }

  async updateStarters(id: string, starters: string) {
    try {
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      return await prisma.agent.update({ data: { starters }, where: { id } });
    } catch (error) {
      console.log(error)
    }
  }

  async removeOldFile(agent: Agent) {
    try {
      const agentConfig = {
        id: agent.assistantId,
        fileId: agent.AgentFiles[0].fileId
      }
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      await this.llmService.unlinkFileFromAgent(agentConfig);
      await prisma.agentFile.delete({ where: { id: agent.AgentFiles[0].id } });
    } catch (error) {
      console.log(error)
    }
  }

  async updateTrainingStatus(agent: Agent, filePath: string) {
    try {
      //After extracting the content from sites
      //Upload the content file to S3
      const response = await this.s3Service.uploadTextFile(filePath);
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      await prisma.agent.update({
        data: {
          siteObjUrl: response.Location,
        }, where: { id: agent.id }
      });

      const file = await this.llmService.uploadFile(filePath);

      await prisma.agentFile.create({
        data: {
          agentId: agent.id,
          fileId: file.id
        }
      });

      await this.fileService.deleteFile(filePath);

      if (agent.AgentFiles && agent.AgentFiles[0]) {
        this.removeOldFile(agent);
      }
    } catch (error) {
      console.log(error)
    }
  }

  async remove(id: string) {
    try {
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      const agent = await prisma.agent.findFirst({
        where: { id }, include: { org: true }
      });
      if (agent) {
        const fileName = `avatar_${agent.org.name.replaceAll(' ', '_').toLowerCase()}_${agent.name.replaceAll(' ', '_').toLowerCase()}.txt`;

        const agentFile = await prisma.agentFile.findFirst({ where: { agentId: agent.id } });

        if (agentFile) {
          await this.s3Service.deleteFile(fileName);
        }
        await this.chroma.deleteNameSapce(agent.name);
        await prisma.site.deleteMany()
        await prisma.callToAction.deleteMany()
        return await prisma.agent.delete({
          where: { id },
        });
      } else {
        throw new NotFoundException(`Agent not found with id ${id}`);
      }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(`Agent not deleted`);
    }

  }

  async makeDeleted(id: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({
      where: { id },
    });
    if (agent) {
      return await prisma.agent.update({
        data: { status: AgentStatus.DELETED },
        where: { id },
      });
    } else {
      throw new NotFoundException(`Agent not found with id ${id}`);
    }
  }

  async isNameExists(name: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({ where: { name: name } });
    if (agent) {
      return true;
    } return false;
  }

  async updateLogo(id: string, logoUrl: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findFirst({
      where: { id },
    });
    if (agent) {
      await this.staticFileService.deleteExistingFile(agent.logoUrl)
      return await prisma.agent.update({
        data: { logoUrl },
        where: { id },
      });
    } else {
      throw new NotFoundException(`Agent not found with id ${id}`);
    }
  }

  async launchAvatarWithAssistant(createAvatarDto: CreateAvatarDto, orgId: string) {
    try {
      const name = createAvatarDto.displayName.replaceAll(" ", "_").toLowerCase().trim();
      const prisma = await this.prismaClientManager.getClient(orgId);
      const avatar = await prisma.agent.create({
        data: {
          displayName: createAvatarDto.displayName,
          name, companyName: createAvatarDto.companyName,
          status: AgentStatus.TRAINING,
          orgId
        }
      });
      const campaign = await prisma.campaign.create({
        data: {
          title: 'Primary',
          description: 'Default Campaign which is used for all converstation without campaign.',
          startDate: new Date(),
          endDate: null,
          isDefault: true
        }
      })
      return avatar;
    } catch (error) {
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      const _avatar = await prisma.agent.findFirst();
      await prisma.agent.delete({ where: { id: _avatar.id } });
      console.log(error)
      throw new InternalServerErrorException('Unable to create avatar');
    }
  }

  async updateAvatar(id: string, createAgentDto: CreateAgentDto, fileId?: string) {
    try {
      //Default UseAssistant to false for all avatar
      createAgentDto.useAssistant = false;
      const useAssistant = createAgentDto.useAssistant;

      //Default LLM Model for all avatar
      createAgentDto.llmModel = process.env.OPENAI_ASSISTANT_DEFAULT_MODEL;

      createAgentDto.welcomeMsg = this.getWelcomeMessage({ ...createAgentDto });
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      const agent = await prisma.agent.update({
        data: {
          ...createAgentDto,
          status: AgentStatus.ACTIVE
        }, where: { id }
      });
      //Create Default stages for agent
      if (agent) {
        await this.stageService.setDefaultStages(agent);
      }
      const instruction = await this.promptService.getAssistantPrompt(agent);

      await this.promptService.create({ agentId: agent.id, type: 'system', text: instruction });

      //create file if fileId found
      if (createAgentDto.siteObjUrl) {
        let org = await prisma.organization.findUnique({ where: { id: agent.orgId } });
        await prisma.agentFile.create({
          data: {
            agentId: agent.id,
            path: createAgentDto.siteObjUrl,
            fileName: `avatar_${org.name.replaceAll(' ', '_').toLowerCase()}_${agent.name.replaceAll(' ', '_').toLowerCase()}.txt`
          }
        });
      }

      return agent;
    } catch (error) {
      console.error(error);
    }
  }

  // Generate embedding script for bot
  async getEmbedding(agentId: string, standalone: boolean = false) {
    const host = process.env.HOST_URL;
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException();
    }

    try {
      const filePath = path.resolve(__dirname, '../../', 'public', 'assets', 'bot', 'js', 'zautobot_v2.js');
      let jsCode = fs.readFileSync(filePath, 'utf8')
        .replaceAll("{{avatarId}}", agentId)
        .replaceAll("{{ApiUrl}}", host + "/")
        .replaceAll("{{BaseUrl}}", host + "/")
        .replaceAll("'{{standAloneFlag}}'", `${standalone}`)

      const options = { toplevel: true, };
      const uglifiedCode = minify(jsCode, options).code;

      return uglifiedCode;
    }
    catch (error) {
      return (error);
    }
  }

  async getDefaultCampaign(orgId: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    return await prisma.campaign.findFirst({
      where: {
        isDefault: true
      }
    })
  }
  async getCampaignByParam(orgId: string, params: string[], paramObj: any) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    let campigns = await prisma.campaign.findMany({ where: { idParam: { in: params } } });
    for (let campign of campigns) {
      if (campign.idValue === paramObj[campign.idParam]) {
        return campign;
      }
    }
    return null;
  }
}
