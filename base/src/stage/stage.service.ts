import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AGENT_STAGES } from 'src/common/templates/agent-prompt.template';
import { AgentPromptService } from 'src/agent-prompt/agent-prompt.service';
import { ServiceParams } from 'src/common/models/service-param.model';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class StageService extends BaseService {
    constructor(
        private readonly promptService: AgentPromptService,) {
        super();
    }

    async findAll(serviceParams: ServiceParams<PaginationDto>) {
        const { orgId, data: paginationDto } = serviceParams;
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const stageData = await prisma.stage.findMany({ skip, take: limit });
            const total = await prisma.stage.count();
            return {
                data: stageData,
                page: page,
                total: total
            };
        }
        catch (err) {
            throw err;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async findOne(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingStage = await prisma.stage.findUnique({ where: { id } });
            if (existingStage) {
                return existingStage;
            }
            else {
                throw new NotFoundException(`Stage not found with id ${id}`);
            }
        }
        catch (err) {
            throw err;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async findAllByOrg(orgId: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingStage = await prisma.stage.findMany({ orderBy: { sequence: 'asc' } });
            if (existingStage) {
                return existingStage;
            }
            else {
                throw new NotFoundException(`Stage not found with id ${orgId}`);
            }
        }
        catch (err) {
            throw err;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async create(serviceParams: ServiceParams<CreateStageDto>) {
        const { orgId, data: createStageDto } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const stageData = await prisma.stage.create({ data: createStageDto });
            const agent = await prisma.agent.findFirst();
            if (agent) {
                const agentPrompt = await this.promptService.findByAgent(orgId, agent.id);
                const prompt = await this.promptService.getAssistantPrompt(orgId, agent);
                console.log(agentPrompt);
                console.log(prompt);

                await this.promptService.update({ orgId, id: agentPrompt.id, data: { type: 'system', text: prompt } });
                console.log("Step 3");
            }
            return stageData;
        }
        catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code == 'P2002') {
                throw new ConflictException("This Stage already exist for this agent");
            } 
            else {
                throw new BadRequestException(error);
            }
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async update(serviceParams: ServiceParams<UpdateStageDto>) {
        const { orgId, data: updateStageDto, id } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingStage = await prisma.stage.findUnique({ where: { id } });
            if (existingStage && existingStage.canEdit) {
                const satgeData = await prisma.stage.update({ data: updateStageDto, where: { id } });
                const agent = await prisma.agent.findFirst();
                if (agent) {
                    const agentPrompt = await this.promptService.findByAgent(orgId, agent.id);
                    const prompt = await this.promptService.getAssistantPrompt(orgId, agent);
                    const updatedPrompt = await this.promptService.update({ orgId, agentId: agentPrompt.id, data: { type: 'system', text: prompt } });
                    const agentFile = await prisma.agentFile.findFirst({
                        where: {
                            agentId: agent.id
                        }
                    });
                    this.promptService.updateAssistent(agent, updatedPrompt, agentFile);
                }
                return satgeData;
            } else if (!existingStage.canEdit) {
                throw new BadRequestException(`Stage ${existingStage.name} is not editable`);
            }
            else {
                throw new NotFoundException(`Stage not found with id ${id}`);
            }
        }
        catch (err) {
            throw err;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async delete(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingStage = await prisma.stage.findUnique({ where: { id } });
            if (existingStage && existingStage.canEdit) {
                const stageData = await prisma.stage.delete({ where: { id } });

                const agent = await prisma.agent.findFirst();
                if (agent) {
                    const agentPrompt = await this.promptService.findByAgent(orgId, agent.id);
                    const prompt = await this.promptService.getAssistantPrompt(orgId, agent);
                    await this.promptService.update({ orgId, id: agentPrompt.id, data: { type: 'system', text: prompt } });
                }
                return stageData;
            } else if (!existingStage.canEdit) {
                throw new BadRequestException(`Stage ${existingStage.name} is not editable`);
            }
            else {
                throw new NotFoundException(`Stage not found with id ${id}`);
            }
        }
        catch (err) {
            throw err;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async updateSquence(serviceParams: ServiceParams<{ updateSquence: any }>) {
        const { orgId, data } = serviceParams;
        const { updateSquence } = data;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const stages: any = [...updateSquence.stages];

            if (stages) {
                //delete stages
                const deletedStages = await prisma.stage.deleteMany();

                // const _stages = await this.prisma.stage.createMany({data: []})

                //create stages
                const newStages = await prisma.stage.createMany({ data: stages });


                const agent = await prisma.agent.findFirst();
                if (agent) {
                    let agentPrompt = await this.promptService.findByAgent(orgId, agent.id);
                    const prompt = await this.promptService.getAssistantPrompt(orgId, agent);
                    let updatedPrompt = await this.promptService.update({ orgId, id: agentPrompt.id, data: { type: 'system', text: prompt } });
                    const agentFile = await prisma.agentFile.findFirst({
                        where: {
                            agentId: agent.id
                        }
                    });
                    this.promptService.updateAssistent(agent, updatedPrompt, agentFile);
                }

                if (deletedStages.count != newStages.count) {
                    return stages;
                }
                else {
                    return newStages;
                }

            }
            else {
                return null;
            }
        }
        catch (err) {
            throw err;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async setDefaultStages(orgId: string, agent: any) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            for (let i = 0; i < AGENT_STAGES.length; i++) {
                const stage = AGENT_STAGES[i];
                const data = {
                    name: stage.name,
                    instruction: stage.instruction,
                    sequence: stage.sequence,
                    canEdit: stage.canEdit || false
                };
                await prisma.stage.create({ data: data });
            }
        } catch (error) {
            console.error(`Error creating stage: `, error);
        } finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async getStagesText(orgId: string, agentId: string) {
        let stagestext = "";
        const prisma = await this.getPrismaClient(orgId);
        try {
            const stages = await prisma.stage.findMany({ orderBy: { sequence: 'asc' } });
            for (let [index, stage] of stages.entries()) {
                stagestext += `${index + 1}.${stage.name}: ${stage.instruction}\n`;
            }
            return stagestext;
        }
        catch (err) {
            throw err;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }
}
