import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateToolDto } from './Dto/create-tool.dto';

@Injectable()
export class ExternalToolService {

    constructor(
        private readonly prisma: PrismaService
    ){}

    async create(createToolDto: CreateToolDto) {
        return this.prisma.externalTool.create({ data:createToolDto });
    }

    async findAll() {
        return this.prisma.externalTool.findMany();
    }

    async findOne(id: string) {
        const tool = await this.prisma.externalTool.findUnique({ where: { id } });
        if (!tool) {
            throw new NotFoundException(`ExternalTool with ID ${id} not found`);
        }
        return tool;
    }

    async getToolByName(name: string)
    {
        const tool = await this.prisma.externalTool.findFirst({ where: { name } });
        if (!tool) {
            throw new NotFoundException(`ExternalTool with name ${name} not found`);
        }
        return tool;
    }

    async update(id: string, createToolDto: CreateToolDto) {
        await this.findOne(id); 
        return this.prisma.externalTool.update({ where: { id }, data:createToolDto });
    }

    async remove(id: string){
        await this.findOne(id); 
        await this.prisma.externalTool.delete({ where: { id } });
    }
}
