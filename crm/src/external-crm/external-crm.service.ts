import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExternalCrmProvider } from './external-crm.provider';
import { CreateCRMMappingsDto } from './dto/create-crm-mappings.dto';
import { MappingService } from '../common/services/mapping.service';
import { ObjectType } from './enum/external-crm.enum';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';


@Injectable()
export class ExternalCrmService {

    private logger = new Logger(ExternalCrmService.name);

    constructor(
        private readonly prismaClientManager: PrismaClientManager,
        private readonly crmProvider: ExternalCrmProvider,
        private readonly mappingService: MappingService,
        @InjectQueue('crm_sync_queue') private crmSyncQueue: Queue,
    ) { }

    getAuthUrl(orgId: string, crmName: string): any {
        const crm = this.crmProvider.getCRM(crmName);
        const additionalInfo = crmName;
        const authUrl = crm.getAuthUrl(orgId, additionalInfo);
        return {
            url: authUrl,
        };
    }
    async exchangeCodeForAccessToken(orgId: string, crmName: string, code: string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const accessToken = await crm.exchangeCodeForAccessToken(orgId, code);
        return accessToken;
    }
    async getAccessToken(orgId: string, crmName: string): Promise<any> {
        const crm = this.crmProvider.getCRM(crmName);
        const accessToken = await crm.getAccessToken(orgId);
        return accessToken;
    }

    async revokeAccess(orgId: string, crmName: string): Promise<void> {
        const crm = this.crmProvider.getCRM(crmName);
        await crm.revokeAccess(orgId);
    }

    async getProfile(orgId: string, crmName: string) {
        const crm = this.crmProvider.getCRM(crmName);
        const profile = await crm.getProfile(orgId);
        return profile;
    }

    async getActiveCRM(orgId: string): Promise<string> {
        try {
            const prisma = await this.prismaClientManager.getClient(orgId);
            const crm = await prisma.externalCrmCredential.findMany();
            return crm[0]?.crmName;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }

    async getContactFields(orgId: string) {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const fields = await crm.getContactProperties(orgId);
        return fields;
    }

    async getCompanyFields(orgId: string) {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const fields = await crm.getCompanyProperties(orgId);
        return fields;
    }

    async getCrmFields(orgId: string, objectType: string) {
        switch (objectType) {
            case ObjectType.CONTACT:
                return await this.getContactFields(orgId);
            case ObjectType.COMPANY:
                return await this.getCompanyFields(orgId);
            default:
                return [];
        }
    }

    async getContacts(orgId: string): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const contacts = await crm.getContacts(orgId);
        return contacts;
    }
    async getContact(orgId: string, id: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.getContact(orgId, id);
        return contact;
    }
    async getContactByEmail(orgId: string, email: string): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.getContactByEmail(orgId, email);
        return contact;
    }
    async createContact(orgId: string, data: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const mappedData = await this.mappingService.handleMapping(orgId, crmName, ObjectType.CONTACT, data);
        const objects = Object.keys(mappedData);
        if (objects.length === 0) return null;
        const contact = await crm.createContact(orgId, mappedData);
        return contact;
    }
    async updateContact(orgId: string, id: any, data: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const mappedData = await this.mappingService.handleMapping(orgId, crmName, ObjectType.CONTACT, data);
        const objects = Object.keys(mappedData);
        if (objects.length === 0) return null;
        const contact = await crm.updateContact(orgId, id, mappedData);
        return contact;
    }
    async deleteContact(orgId: string, id: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const contact = await crm.deleteContact(orgId, id);
        return contact;
    }
    async getCompanies(orgId: string): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const companies = await crm.getCompanies(orgId);
        return companies;
    }
    async getCompany(orgId: string, id: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const company = await crm.getCompany(orgId, id);
        return company;
    }
    async getCompanyByName(orgId: string, domain: string): Promise<any> {
        try {
            const crmName = await this.getActiveCRM(orgId);
            if (!crmName) {
                return
            }
            const crm = this.crmProvider.getCRM(crmName);
            const company = await crm.getCompanyByName(orgId, domain);
            return company;
        }
        catch (err) {
            this.logger.error(err);
            throw new Error(err);
        }
    }
    async createCompany(orgId: string, data: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const mappedData = await this.handleMapping(orgId, crmName, ObjectType.COMPANY, data);
        const objects = Object.keys(mappedData);
        if (objects.length === 0) return null;
        const company = await crm.createCompany(orgId, mappedData);
        return company;
    }
    async updateCompany(orgId: string, id: any, data: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const mappedData = await this.handleMapping(orgId, crmName, ObjectType.COMPANY, data);
        const objects = Object.keys(mappedData);
        if (objects.length === 0) return null;
        const company = await crm.updateCompany(orgId, id, mappedData);
        return company;
    }
    async deleteCompany(orgId: string, id: any): Promise<any> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        const company = await crm.deleteCompany(orgId, id);
        return company;
    }

    async getMappingsByCrmName(orgId: string, crmName: string, object_type: string) {
        const mapping = await this.mappingService.getMappingsByCrmName(orgId, crmName, object_type);
        return mapping;
    }
    async createMappings(orgId: string, createCRMMappingsDto: CreateCRMMappingsDto): Promise<any> {
        for (const _mapping of createCRMMappingsDto.mappings) {
            const mapping = await this.mappingService.getMappingByCrmNameAndObjectTypeAndField(orgId, _mapping.crmName, _mapping.objectType, _mapping.fieldName);
            if (mapping) {
                if (_mapping.externalCRMFieldName == null || _mapping.externalCRMFieldName == 'null') {
                    await this.mappingService.deleteMapping(orgId, mapping.id);
                }
                else if (mapping.externalCRMFieldName !== _mapping.externalCRMFieldName) {
                    await this.mappingService.updateMapping(orgId, mapping.id, _mapping);
                }
                continue;
            };
            if (_mapping.externalCRMFieldName == null) continue;
            await this.mappingService.createMapping(orgId, _mapping);
        }
        if (createCRMMappingsDto.mappings.length > 0) {
            this.syncContacts(orgId, createCRMMappingsDto.mappings[0].crmName);
        }
        return {
            status: 200,
            message: 'success',
            data: createCRMMappingsDto.mappings
        };
    }
    async handleMapping(orgId: string, crmName: string, objectType: string, data: any): Promise<any> {
        const mappings = await this.mappingService.getMappingsBycrmNameAndObjectType(orgId, crmName, objectType);
        let mappedData = {};
        for (const mapping of mappings) {
            const externalCRMFieldName = mapping.externalCRMFieldName;
            const fieldName = mapping.fieldName;
            if (externalCRMFieldName == null) continue;
            const mappedValue = data[fieldName];
            if (mappedValue !== undefined && mappedValue !== null) {
                mappedData[externalCRMFieldName] = mappedValue;
            }
        }
        return mappedData;
    }

    async handleReverseMapping(orgId: string, crmName: string, objectType: string, mappedData: any): Promise<any> {
        const reverseMappings = await this.mappingService.getMappingsBycrmNameAndObjectType(orgId, crmName, objectType);
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

    async syncContacts(orgId: string, crmName: string): Promise<any> {
        this.crmSyncQueue.add('SyncContact', {
            orgId: orgId,
            crmName: crmName
        });
    }

    async hasPriority(orgId: string): Promise<Boolean> {
        const crmName = await this.getActiveCRM(orgId);
        if (!crmName) {
            return
        }
        const crm = this.crmProvider.getCRM(crmName);
        return await crm.hasPriority(orgId);
    }
}
