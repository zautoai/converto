import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateKeyMappingDto } from './dto/create-maping.sto';
import { UpdateKeyMappingDto } from './dto/update-maping.dto';
import { ZautoCRMProperties } from 'src/common/configs/oauth.config';
import { ExternalToolService } from 'src/external-tool/external-tool.service';
import { OauthService } from 'src/oauth/oauth.service';
import { Client } from '@hubspot/api-client';

@Injectable()
export class CrmKeyMapingService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly externalToolService: ExternalToolService,
        private readonly oauthService: OauthService
    ){}

    async create(createKeyMappingDto: CreateKeyMappingDto)
    {
        const existingKeymap = await this.prisma.keyMapping.findFirst({
            where:{
                fieldName:createKeyMappingDto.fieldName,
                externalFieldName:createKeyMappingDto.externalFieldName,
                orgToolId: createKeyMappingDto.orgToolId
            }
        });
        if(existingKeymap)
        {
            throw new ConflictException(`Already mapped with same field.`);
        }
        return await this.prisma.keyMapping.create({data:createKeyMappingDto});
    }

    async findAll(orgId: string, orgToolId: string) {
        return await this.prisma.keyMapping.findMany({where: {orgId,orgToolId}});
    }

    async findOne(id: string) {
        const keyMapping = await this.prisma.keyMapping.findUnique({
            where: { id }
        });
        if (!keyMapping) {
            throw new NotFoundException(`Key mapping with ID ${id} not found.`);
        }
        return keyMapping;
    }

    async update(id: string, updateKeyMappingDto: UpdateKeyMappingDto) {
        const keyMapping = await this.prisma.keyMapping.findUnique({
            where: { id }
        });
        if (!keyMapping) {
            throw new NotFoundException(`Key mapping with ID ${id} not found.`);
        }
        return await this.prisma.keyMapping.update({
            where: { id },
            data: updateKeyMappingDto
        });
    }

    async remove(id: string) {
        const keyMapping = await this.prisma.keyMapping.findUnique({
            where: { id }
        });
        if (!keyMapping) {
            throw new NotFoundException(`Key mapping with ID ${id} not found.`);
        }
        return await this.prisma.keyMapping.delete({
            where: { id }
        });
    }

    async getProperties(orgId: string,provider: string,userId: string)
    {
        
        if(provider == 'zauto')
        {
            const leadConfig = await this.prisma.agent.findFirst({
                where:{orgId},
                select:{leadInfo:true}
            })
            const leadInfo = leadConfig.leadInfo.toLocaleLowerCase().split(',')
            .map(item => item.trim().replace(/\s/g, '_'))
            .map(item => `lead.info.${item}`);
            let properties = {...ZautoCRMProperties};
            properties.lead = [...properties.lead,...leadInfo]
            return properties;
        }
        const tool = await this.externalToolService.getToolByName(provider);
        if(provider == 'hubspot')
        {
            try {
                const tokenData = await this.oauthService.getAccessToken(orgId,provider,userId);
                const hubspotClient = new Client({
                    accessToken: tokenData.accessToken
                });
                const response = await hubspotClient.apiRequest({
                    method:'GET',
                    path:'/properties/v2/contacts/properties?property=name,label,readOnlyValue',
                });

                const hs_contact_properties = await response.json();
                const mapped_properties = hs_contact_properties
                .filter(property => !property.readOnlyValue)
                .map(obj => obj.name);
                return mapped_properties;
            }
            catch(error)
            {
                console.error('Error fetching properties:', error);
                throw new BadRequestException('Error fetching properties');
            }
            
        }
        return null;
    }
}
