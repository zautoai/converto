import { Injectable } from '@nestjs/common';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { CrmMappingDto } from '../../external-crm/dto/crm-mapping.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class MappingService {

    constructor(
        private readonly prismaClientManager: PrismaClientManager,
    ){}

    async getMappingById(orgId:string,id: string){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mapping = await prisma.crmMapping.findUnique({
                where: {
                    id
                }
            });
            return mapping;
        }
        catch(e)
        {
            throw e;
        }
    }

    async getMappingsByCrmName(orgId:string, crmName: string,object_type:string){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mappings = await prisma.crmMapping.findMany({
                where: {
                    crmName,
                    objectType: object_type
                }
            });
            return mappings;
        }
        catch(e)
        {
            throw e;
        }
    }

    async getMappingsBycrmNameAndObjectType(orgId:string, crmName: string, objectType: string){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mappings = await prisma.crmMapping.findMany({
                where: {
                    crmName,
                    objectType
                }
            });
            return mappings;
        }
        catch(e)
        {
            throw e;
        }
    }

    async getMappingsByObjectType(orgId:string, objectType: string){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mappings = await prisma.crmMapping.findMany({
                where: {
                    objectType
                }
            });
            return mappings;
        }
        catch(e)
        {
            throw e;
        }
    }

    async getMappingByCrmNameAndObjectTypeAndField(orgId:string, crmName: string, objectType: string, fieldName: string){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mapping = await prisma.crmMapping.findFirst({
                where: {
                    crmName,
                    objectType,
                    fieldName
                }
            });
            return mapping;
        }
        catch(e)
        {
            throw e;
        }
    }

    async createMapping(orgId:string, crmMappingDto: CrmMappingDto){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mapping = await prisma.crmMapping.create({
                data:crmMappingDto
            });

            return mapping;
        }
        catch(e)
        {
            throw e;
        }
    }

    async updateMapping(orgId:string, id: string, crmMappingDto: CrmMappingDto){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mapping = await prisma.crmMapping.update({
                where: {
                    id
                },
                data:crmMappingDto
            });
            // this.crmSyncQueue.add('SyncContact',{
            //     orgId: orgId,
            //     crmName: crmMappingDto.crmName,
            //     objectType: crmMappingDto.objectType,
            // });
            return mapping;
        }
        catch(e)
        {
            throw e;
        }
    }

    async deleteMapping(orgId:string, id: string){
        try
        {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const mapping = await prisma.crmMapping.delete({
                where: {
                    id
                }
            });
            return mapping;
        }
        catch(e)
        {
            throw e;
        }
    }

    async handleMapping(orgId: string, crmName: string, objectType:string,data: any): Promise<any> {
        const mappings = await this.getMappingsBycrmNameAndObjectType(orgId, crmName, objectType);
        let mappedData = {};
        for(const mapping of mappings)
        {
            const externalCRMFieldName = mapping.externalCRMFieldName;
            const fieldName = mapping.fieldName;
            if(externalCRMFieldName == null) continue;
            mappedData[externalCRMFieldName] = data[fieldName]; 
        }
        return mappedData;       
    }

    async handleReverseMapping(orgId: string, crmName: string, objectType:string, mappedData: any): Promise<any> {
        const reverseMappings = await this.getMappingsBycrmNameAndObjectType(orgId, crmName, objectType);
        let originalData = {};
        for (const reverseMapping of reverseMappings) {
            const externalCRMFieldName = reverseMapping.externalCRMFieldName;
            const fieldName = reverseMapping.fieldName;
            if (externalCRMFieldName == null) continue;
            const mappedValue = mappedData[externalCRMFieldName];
            if (mappedValue !== undefined) {
                originalData[fieldName] = mappedValue;
            }
        }
        return originalData;
    }
}
