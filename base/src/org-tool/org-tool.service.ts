import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrgToolDto } from './dto/create-org-tool.dto';

@Injectable()
export class OrgToolService {

    constructor(
        private readonly prisma: PrismaService,
    ){}

    async create(createOrgToolDto: CreateOrgToolDto) {
        return this.prisma.orgTool.create({ data:createOrgToolDto });
    }

    async findAll() {
        return this.prisma.orgTool.findMany({
            select:{
                id: true,
                orgId: true,
                userId: true,
                externalTool: {
                    select:{
                        id: true,
                        name: true,
                        level: true
                    }
                }
            },
        });
    }

    async findOne(id: string) {
        const tool = await this.prisma.orgTool.findUnique({ 
            where: { id },
            select:{
                id: true,
                orgId: true,
                userId: true,
                externalTool: {
                    select:{
                        id: true,
                        name: true,
                        level: true
                    }
                }
            }, 
        });
        if (!tool) {
            throw new NotFoundException(`OrgTool with ID ${id} not found`);
        }
        return tool;
    }

    async findAllByOrg(orgId: string)
    {
        const tool = await this.prisma.orgTool.findMany({ 
            where: { orgId },
            select:{
                id: true,
                orgId: true,
                userId: true,
                externalTool: {
                    select:{
                        id: true,
                        name: true,
                        level: true
                    }
                }
            }, 
        });
        if (!tool) {
            throw new NotFoundException(`OrgTool with ID ${orgId} not found`);
        }
        return tool;
    }

    async findByToolName(toolName: string, orgId: string) {
        const tools = await this.prisma.orgTool.findFirst({
            where: {
                orgId:orgId,
                externalTool: {
                    name: toolName
                }
            },
            select:{
                id: true,
                orgId: true,
                userId: true,
                externalTool: {
                    select:{
                        id: true,
                        name: true,
                        level: true
                    }
                }
            }
        });
        if (!tools) {
            throw new NotFoundException(`No OrgTool found with name ${toolName}`);
        }
        return tools;
    }

    async update(id: string, createOrgToolDto: CreateOrgToolDto) {
        await this.findOne(id);
        return this.prisma.orgTool.update({ where: { id }, data:createOrgToolDto });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.orgTool.delete({ where: { id } });
    }
}
