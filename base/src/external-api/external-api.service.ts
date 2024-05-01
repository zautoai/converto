import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExternalApiDto } from './dto/create-external-api.dto';
import { UpdateExternalApiDto } from './dto/update-external-api.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ExternalApiService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async create(createExternalApiDto: CreateExternalApiDto) {
        const existingApi = await this.prisma.externalApi.findFirst({
            where: { name: createExternalApiDto.name },
        });
        if (existingApi) {
            throw new ConflictException(`API already exists with name ${existingApi.name}`);
        }
        return await this.prisma.externalApi.create({ data: createExternalApiDto });
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.prisma.externalApi.findMany({
            skip, 
            take: limit
        });
        const total = await this.prisma.externalApi.count({});
        return {
            data: data,
            page: page,
            total: total
        };
    }

    async findAllByOrg(orgId: string,paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.prisma.externalApi.findMany({
            where: {
                orgId
            },
            skip, 
            take: limit
        });
        const total = await this.prisma.externalApi.count({
            where: {
                orgId
            }
        });
        return {
            data: data,
            page: page,
            total: total
        };
    }

    async findOne(id: string) {
        const externalApi = await this.prisma.externalApi.findUnique({ 
            where: { 
                id 
            },
            include:{
                KeyMapping: true
            }
        });
        if (!externalApi) {
            throw new NotFoundException(`API with ID ${id} not found`);
        }
        return externalApi;
    }

    async update(id: string, updateExternalApiDto: UpdateExternalApiDto) {
        const existingApi = await this.findOne(id);
        return await this.prisma.externalApi.update({
            where: { id },
            data: updateExternalApiDto,
        });
    }

    async remove(id: string): Promise<void> {
        const existingApi = await this.findOne(id);
        await this.prisma.externalApi.delete({ where: { id } });
    }
}
