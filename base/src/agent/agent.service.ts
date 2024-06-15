import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AgentPromptService } from 'src/agent-prompt/agent-prompt.service';
import { ChromaDBService } from 'src/chroma/chroma-dbservice/chroma-db.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ServiceParams } from 'src/common/models/service-param.model';
import { BaseService } from 'src/common/services/base.service';
import { FileUtilService } from 'src/common/services/file-utility.service';
import { S3Service } from 'src/common/services/s3.service';
import { StaticFileService } from 'src/common/services/static.service';
import { LlmService } from 'src/llm/llm.service';
import { StageService } from 'src/stage/stage.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent, AgentStatus } from './entities/agent.entity';
import * as fs from 'fs';
import * as path from 'path';
const { minify } = require('uglify-js');

@Injectable()
export class AgentService extends BaseService {

  constructor(
    private readonly promptService: AgentPromptService,
    private readonly chroma: ChromaDBService,
    private readonly staticFileService: StaticFileService,
    private fileService: FileUtilService,
    private readonly s3Service: S3Service,
    private readonly llmService: LlmService,
    private readonly stageService: StageService,
  ) {
    super();
  }


  getWelcomeMessage(agent: any) {
    const message = `Hello! 👋 I'm ${agent.displayName} from ${agent.companyName}, How can I help you?`;
    return message;
  }

  async createOpenAIAssistant(serviceParams: ServiceParams<Agent>) {
    const { orgId, data: agent, fileId } = serviceParams;
    const assistant = await this.llmService.createAgent({
      name: agent.displayName,
      model: agent.llmModel,
      instructions: await this.promptService.getAssistantPrompt(orgId, agent),
      fileIds: [fileId]
    });
    const prisma = await this.getPrismaClient(orgId);
    try {
      await prisma.agent.update({
        data: {
          assistantId: assistant.id,
        }, where: { id: agent.id }
      });
    }
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async create(serviceParams: ServiceParams<CreateAgentDto>) {
    const { orgId, data: createAgentDto, fileId } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const isExist = await this.isNameExists(orgId, createAgentDto.name);
      //Default UseAssistant for all avatar
      createAgentDto.useAssistant = true;
      const useAssistant = createAgentDto.useAssistant;
      //Default LLM Model for all avatar
      createAgentDto.llmModel = process.env.OPENAI_ASSISTANT_DEFAULT_MODEL;

      if (isExist) {
        throw new ConflictException('Agent name alread taken.')
      } else {
        createAgentDto.welcomeMsg = this.getWelcomeMessage({ ...createAgentDto });
        const agent = await prisma.agent.create({ data: createAgentDto });
        setImmediate(async () => {
          const instruction = await this.promptService.getAssistantPrompt(orgId, agent);
          await this.chroma.createNameSapce(agent.name);
          await this.promptService.create({ orgId, data: { agentId: agent.id, type: 'system', text: instruction } })
          //Create Default stages for agent
          if (agent) {
            await this.stageService.setDefaultStages(orgId, agent);
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
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const { page, limit } = paginationDto;
      const skip = (page - 1) * limit;
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
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findAllByOrg(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {

      const { page, limit } = paginationDto;
      const skip = (page - 1) * limit;
      const agents = await prisma.agent.findMany({
        skip,
        take: limit,
        where: { status: { not: AgentStatus.DELETED } }
      });
      const total = await prisma.agent.count();
      return {
        data: agents,
        page: page,
        total: total,
      };
    }
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const agent = await prisma.agent.findFirst();
      if (agent) {
        return agent;
      } else {
        throw new NotFoundException(`Agent not found with id ${id}`);
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findOneByOrg(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const agent = await prisma.agent.findFirst();
      if (agent) {
        return agent;
      } else {
        return null;
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async update(serviceParams: ServiceParams<UpdateAgentDto>) {
    const { orgId, data: updateAgentDto, id } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const welcomeMsg = this.getWelcomeMessage({ ...updateAgentDto });
      updateAgentDto.welcomeMsg = welcomeMsg;
      const agent = await prisma.agent.findFirst({
        where: { id },
      });
      if (agent) {
        const updatedAgent = await prisma.agent.update({
          data: updateAgentDto,
          where: { id },
        });
        const prompt = await this.promptService.getAssistantPrompt(orgId, agent);
        const agentPrompt = await this.promptService.updateByAgent({ orgId, data: { type: 'system', text: prompt }, agentId: agent.id })
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
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateStyles(serviceParams: ServiceParams<{ id: string, styledata: any }>) {
    const { orgId, data } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const { id, styledata } = data;
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
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateLeadInfo(serviceParams: ServiceParams<{ id: string, leadInfo: string }>) {
    const { orgId, data } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const { id, leadInfo } = data;
      const agent = await prisma.agent.findFirst({
        where: { id },
      });
      if (agent) {
        const updatedAgent = await prisma.agent.update({
          data: { leadInfo },
          where: { id },
        });
        const prompt = await this.promptService.getAssistantPrompt(orgId, updatedAgent)
        const agentPrompt = await this.promptService.updateByAgent({ orgId, agentId: agent.id, data: { type: 'system', text: prompt } });
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
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateStatus(serviceParams: ServiceParams<{ id: string, status: AgentStatus }>) {
    const { orgId, data } = serviceParams;
    const { id, status } = data;
    const prisma = await this.getPrismaClient(orgId);
    try {
      prisma.agent.update({ data: { status }, where: { id } });
    } catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateStarters(serviceParams: ServiceParams<{ id: string, starters: string }>) {
    const { orgId, data } = serviceParams;
    const { id, starters } = data;
    const prisma = await this.getPrismaClient(orgId);
    try {
      return await prisma.agent.update({ data: { starters }, where: { id } });
    } catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async removeOldFile(serviceParams: ServiceParams<Agent>) {
    const { orgId, data: agent } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const agentConfig = {
        id: agent.assistantId,
        fileId: agent.AgentFiles[0].fileId
      }
      await this.llmService.unlinkFileFromAgent(agentConfig);
      await prisma.agentFile.delete({ where: { id: agent.AgentFiles[0].id } });
    } catch (error) {
      console.log(error)
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateTrainingStatus(serviceParams: ServiceParams<{ agent: Agent, filePath: string }>) {
    const { orgId, data } = serviceParams;
    const { agent, filePath } = data;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const response = await this.s3Service.uploadTextFile(filePath);
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
        this.removeOldFile({ orgId, data: agent });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async remove(orgId: string, id: string) {
    try {
      const prisma = await this.getPrismaClient(orgId);
      const agent = await prisma.agent.findFirst({
        where: { id }
      });
      if (agent) {
        const fileName = `avatar_${orgId.replaceAll('-', '_').toLowerCase()}_${agent.name.replaceAll(' ', '_').toLowerCase()}.txt`;

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

  async makeDeleted(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
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
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async isNameExists(orgId: string, name: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const agent = await prisma.agent.findFirst({ where: { name: name } });
      if (agent) {
        return true;
      } return false;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateLogo(serviceParams: ServiceParams<{ id: string, logoUrl: string }>) {
    const { orgId, data } = serviceParams;
    const { id, logoUrl } = data;
    const prisma = await this.getPrismaClient(orgId);
    try {
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
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async launchAvatarWithAssistant(serviceParams: ServiceParams<CreateAvatarDto>) {
    const { orgId, data: createAvatarDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const name = createAvatarDto.displayName.replaceAll(" ", "_").toLowerCase().trim();
      const avatar = await prisma.agent.create({
        data: {
          displayName: createAvatarDto.displayName,
          name, companyName: createAvatarDto.companyName,
          status: AgentStatus.TRAINING
        }
      });
      const campaignName = "Primary";
      const existingCampaign = await prisma.campaign.findFirst({
        where: {
          title: campaignName
        }
      });
      if (!existingCampaign) {
        const campaign = await prisma.campaign.create({
          data: {
            title: campaignName,
            description: 'Default Campaign which is used for all converstation without campaign.',
            startDate: new Date(),
            endDate: null,
            isDefault: true
          }
        });
        if (campaign) {
          console.log('Default campaign created');
        }
      }
      return avatar;
    } catch (error) {
      const prisma = await this.getPrismaClient(orgId)
      const _avatar = await prisma.agent.findFirst();
      await prisma.agent.delete({ where: { id: _avatar.id } });
      console.log(error)
      throw new InternalServerErrorException('Unable to create avatar');
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateAvatar(serviceParams: ServiceParams<CreateAgentDto>) {
    const { orgId, data: createAgentDto, id, fileId } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      //Default UseAssistant to false for all avatar
      createAgentDto.useAssistant = false;
      const useAssistant = createAgentDto.useAssistant;

      //Default LLM Model for all avatar
      createAgentDto.llmModel = process.env.OPENAI_ASSISTANT_DEFAULT_MODEL;

      createAgentDto.welcomeMsg = this.getWelcomeMessage({ ...createAgentDto });
      const existingAgent = await prisma.agent.findFirst();
      if (!existingAgent) {
        throw new InternalServerErrorException('Unable to create avatar');
      }
      const agent = await prisma.agent.update({
        data: {
          ...createAgentDto,
          status: AgentStatus.ACTIVE
        }, where: { id: existingAgent.id }
      });
      //Create Default stages for agent
      if (agent) {
        await this.stageService.setDefaultStages(orgId, agent);
      }
      const instruction = await this.promptService.getAssistantPrompt(orgId, agent);

      await this.promptService.create({ orgId, data: { agentId: agent.id, type: 'system', text: instruction } })

      //create file if fileId found
      if (createAgentDto.siteObjUrl) {
        const masterPrisma = await this.getPrismaMasterClient();
        let org = await masterPrisma.organization.findUnique({ where: { id: orgId } });
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
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }


  // Generate embedding script for bot
  async getEmbedding(orgId:string,agentId: string,standalone: boolean = false) {

    try {
      let host = process.env.HOST_URL;

        // Extract the protocol and domain from HOST_URL
        const url = new URL(host);
        const protocol = url.protocol; // will include the trailing ':'
        const baseHost = url.host; // will include hostname and port if any

        // Construct the full URL with orgId as subdomain
        const fullHost = `${protocol}//${orgId}.${baseHost}`
      
      // const agent = await this.prisma.agent.findUnique({where:{id:agentId}}); 
      // if(!agent)
      // {
      //   throw new NotFoundException();
      // }
      
      const filePath = path.resolve(__dirname, '../../', 'public','assets','bot','js','zautobot_v2.js');
      let jsCode = fs.readFileSync(filePath, 'utf8')
      .replaceAll("{{avatarId}}",agentId)
      .replaceAll("{{ApiUrl}}",fullHost + "/")
      .replaceAll("{{BaseUrl}}",fullHost + "/")
      .replaceAll("'{{standAloneFlag}}'",`${standalone}`)
  
      const options = {toplevel: true,};
      const uglifiedCode = minify(jsCode,options).code;
  
      return uglifiedCode;
    }
    catch (error) {
      throw error;
    }
  }

  async getDefaultCampaign(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      return await prisma.campaign.findFirst({
        where: {
          isDefault: true
        }
      })
    }
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }
  async getCampaignByParam(orgId: string, params: string[], paramObj: any) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      let campigns = await prisma.campaign.findMany({ where: { idParam: { in: params } } });
      for (let campign of campigns) {
        if (campign.idValue === paramObj[campign.idParam]) {
          return campign;
        }
      }
      return null;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }
}
