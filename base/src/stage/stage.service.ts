import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AGENT_STAGES } from 'src/common/templates/agent-prompt.template';
import { AgentPromptService } from 'src/agent-prompt/agent-prompt.service';

@Injectable()
export class StageService {
    constructor(private readonly prisma: PrismaService,
        private readonly promptService: AgentPromptService,) { }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const stageData = await this.prisma.stage.findMany({ skip, take: limit });
        const total = await this.prisma.stage.count();
        return {
            data: stageData,
            page: page,
            total: total
        };
    }

    async findAllByAgent(agentId: string, paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const stageData = await this.prisma.stage.findMany({
            skip,
            take: limit,
            where: { agentId },
            orderBy: { sequence: 'asc' }
        });
        const total = await this.prisma.stage.count({ where: { agentId } });
        return {
            data: stageData,
            page: page,
            total: total
        };
    }

    async findOne(id: string) {
        const existingStage = await this.prisma.stage.findUnique({ where: { id } });
        if (existingStage) {
            return existingStage;
        }
        else {
            throw new NotFoundException(`Stage not found with id ${id}`);
        }
    }

    async findAllByOrg(orgId: string) {
        const existingStage = await this.prisma.stage.findMany({ where: { orgId }, orderBy: { sequence: 'asc' } });
        if (existingStage) {
            return existingStage;
        }
        else {
            throw new NotFoundException(`Stage not found with id ${orgId}`);
        }
    }

    async create(createStageDto: CreateStageDto) {
        try {
            const stageData = await this.prisma.stage.create({ data: createStageDto });

            const agent = await this.prisma.agent.findUnique({ where: { id: createStageDto.agentId } });
            if (agent) {
                const agentPrompt = await this.promptService.findByAgent(agent.id);
                await this.promptService.update(agentPrompt.id, { type: 'system', text: await this.promptService.getAssistantPrompt(agent) });
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
    }

    async update(id: string, updateStageDto: UpdateStageDto) {
        const existingStage = await this.prisma.stage.findUnique({ where: { id } });
        if (existingStage && existingStage.canEdit) {
            const satgeData = await this.prisma.stage.update({ data: updateStageDto, where: { id } });
            const agent = await this.prisma.agent.findUnique({ where: { id: existingStage.agentId } });
            if (agent) {
                const agentPrompt = await this.promptService.findByAgent(agent.id);
                const updatedPrompt = await this.promptService.update(agentPrompt.id, { type: 'system', text: await this.promptService.getAssistantPrompt(agent) });
                const agentFile = await this.prisma.agentFile.findFirst({
                    where: {
                        agentId: agent.id
                    }
                });
                this.promptService.updateAssistent(agent,updatedPrompt,agentFile);
            }
            return satgeData;
        } else if(!existingStage.canEdit) {
            throw new BadRequestException(`Stage ${existingStage.name} is not editable`);
        }
        else {
            throw new NotFoundException(`Stage not found with id ${id}`);
        }
    }

    async delete(id: string) {
        const existingStage = await this.prisma.stage.findUnique({ where: { id } });
        if (existingStage && existingStage.canEdit) {
            const stageData = await this.prisma.stage.delete({ where: { id } });

            const agent = await this.prisma.agent.findUnique({ where: { id: existingStage.agentId } });
            if (agent) {
                const agentPrompt = await this.promptService.findByAgent(agent.id);
                await this.promptService.update(agentPrompt.id, { type: 'system', text: await this.promptService.getAssistantPrompt(agent) });
            }
            return stageData;
        } else if(!existingStage.canEdit) {
            throw new BadRequestException(`Stage ${existingStage.name} is not editable`);
        }
        else {
            throw new NotFoundException(`Stage not found with id ${id}`);
        }
    }

    async updateSquence(agentId: string, updateSquence: any) {
        const stages: any = [...updateSquence.stages];
        if (stages) {
            //delete stages
            const deletedStages = await this.prisma.stage.deleteMany({ where: { agentId: agentId } });

            // const _stages = await this.prisma.stage.createMany({data: []})

            //create stages
            const newStages = await this.prisma.stage.createMany({ data: stages });


            const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
            if (agent) {
                let agentPrompt = await this.promptService.findByAgent(agent.id);
                let updatedPrompt = await this.promptService.update(agentPrompt.id, { type: 'system', text: await this.promptService.getAssistantPrompt(agent) });
                const agentFile = await this.prisma.agentFile.findFirst({
                    where: {
                        agentId: agent.id
                    }
                });
                this.promptService.updateAssistent(agent,updatedPrompt,agentFile);
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

    async setDefaultStages(agent: any) {
        try {
            for (let i = 0; i < AGENT_STAGES.length; i++) {
                const stage = AGENT_STAGES[i];
                const data = {
                    agentId: agent.id,
                    orgId: agent.orgId,
                    name: stage.name,
                    instruction: stage.instruction,
                    sequence: stage.sequence,
                    canEdit: stage.canEdit || false
                };
                await this.prisma.stage.create({ data: data });
            }
        } catch (error) {
            console.error(`Error creating stage: `, error);
            console.error(error)
        }
    }

    async getStagesText(agentId: string) {
        let stagestext = "";
        const stages = await this.prisma.stage.findMany({ where: { agentId }, orderBy: { sequence: 'asc' } });
        for (let [index, stage] of stages.entries()) {
            stagestext += `${index + 1}.${stage.name}: ${stage.instruction}\n`;
        }
        return stagestext;
    }

}
