import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExternalApiKeyMappingDto } from './dto/update-external-api.keymapping.dto';
import { UpdateExternalApiKeyMappingDto } from './dto/create-external-api.keymapping.dto';

@Injectable()
export class ExternalApiKeyMappingService {

    constructor(
        private readonly prisma: PrismaService
    ){}

    async create(createExternalApiKeyMappingDto: CreateExternalApiKeyMappingDto) {
        const existingApiKeymapping = await this.prisma.keyMapping.findFirst({
            where:{
                apiId: createExternalApiKeyMappingDto.apiId,
                fieldName:createExternalApiKeyMappingDto.fieldName,
                externalFieldName:createExternalApiKeyMappingDto.externalFieldName,
            }
        });
        if(existingApiKeymapping)
        {
            throw new ConflictException(`Keymapping already exist`);
        }
        return await this.prisma.keyMapping.create({ data: createExternalApiKeyMappingDto });
    }

    async findAll() {
        return await this.prisma.keyMapping.findMany();
    }

    async findAllByApi(apiId: string) {

        return await this.prisma.keyMapping.findMany({
            where: {
                apiId
            }
        });
    }

    async findAllByOrg(orgId: string) {
        return await this.prisma.keyMapping.findMany({
            where: {
                orgId
            }
        });
    }

    async findOne(id: string) {
        const externalApi = await this.prisma.keyMapping.findUnique({ 
            where: { 
                id 
            }
        });
        if (!externalApi) {
            throw new NotFoundException(`Keymapping with ID ${id} not found`);
        }
        return externalApi;
    }

    async update(id: string, updateExternalApiKeyMappingDto: UpdateExternalApiKeyMappingDto) {
        const existingApiKeymapping = await this.findOne(id);
        return await this.prisma.keyMapping.update({
            where: { id },
            data: updateExternalApiKeyMappingDto,
        });
    }

    async remove(id: string) {
        const existingApiKeymapping = await this.findOne(id);
        await this.prisma.keyMapping.delete({ where: { id } });
    }
}
