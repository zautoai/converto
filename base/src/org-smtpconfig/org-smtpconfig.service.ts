import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrgSmtpconfigDto } from './dto/create-org-smtpconfig.dto';
import { UpdateOrgSmtpconfigDto } from './dto/update-org-smtpconfig.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { SmtpService } from 'src/common/services/smtp.service';
import { HashingService } from 'src/common/services/hashing.service';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class OrgSmtpconfigService extends BaseService{

    constructor(
        private organizationsService: OrganizationsService,
        private smtpService: SmtpService,
        private hashingService: HashingService,
    ) {
        super();
    }

    async create(serviceParams: ServiceParams<CreateOrgSmtpconfigDto>) {
        const { orgId, data: createOrgSmtpconfigDto } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        // verify connection
        const isConnectionOk = await this.smtpService.verifyConnection(createOrgSmtpconfigDto);

        if (!isConnectionOk) {
            throw new BadRequestException("Failed to establish a connection with the SMTP server. Please check your SMTP configuration and try again.");
        }
        let data = createOrgSmtpconfigDto;
        data.pass = this.hashingService.encryt(data.pass);

        const existingConfigs = await this.getActiveConfigByOrg(orgId);
        if (!existingConfigs) {
            data = { ...data, ...{ isActive: true } };
        }
        const smtpConfig = await prisma.orgSMTPConfig.create({ data: data });
        delete smtpConfig.pass;
        return smtpConfig;
    }

    async findAll(serviceParams: ServiceParams<PaginationDto>) {
        const { orgId ,data: paginationDto } = serviceParams;
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const prisma = await this.getPrismaClient(orgId);
        const smtpConfigs = await prisma.orgSMTPConfig.findMany({
            skip,
            take: limit,
        });
        const total = await prisma.orgSMTPConfig.count();
        return {
            data: smtpConfigs,
            page: page,
            total: total,
        };
    }

    async findOne(orgId: string,id: string) {
        const prisma = await this.getPrismaClient(orgId);
        const existing = await prisma.orgSMTPConfig.findUnique({ where: { id } });
        if (existing) {
            existing.pass = this.hashingService.decrypt(existing.pass);
            return existing;
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${id}`);
        }
    }

    async getByOrg(orgId: string) {
        const prisma = await this.getPrismaClient(orgId);
        const existing = await prisma.orgSMTPConfig.findFirst();
        if (existing) {
            return existing;
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${orgId}`);
        }
    }

    async getActiveConfigByOrg(orgId: string) {
        const prisma = await this.getPrismaClient(orgId);
        const existing = await prisma.orgSMTPConfig.findFirst({ where: { isActive: true } });
        if (existing) {
            return existing;
        }
        else {
            return null;
        }
    }

    async update(serviceParams: ServiceParams<{id: string, updateOrgSmtpconfigDto: UpdateOrgSmtpconfigDto}>) {
        const { orgId, data: {id, updateOrgSmtpconfigDto} } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        const existing = await prisma.orgSMTPConfig.findUnique({ where: { id } });
        if (existing) {
            // verify connection
            let data;
            if(!data.pass)
            {
                const pass = this.hashingService.decrypt(existing.pass);
                data = {pass,...updateOrgSmtpconfigDto};
            }
            const isConnectionOk = await this.smtpService.verifyConnection(data);

            if (!isConnectionOk) {
                throw new BadRequestException("Failed to establish a connection with the SMTP server. Please check your SMTP configuration and try again.");
            }
            data.pass = this.hashingService.encryt(data.pass);
            const smtpConfig = await prisma.orgSMTPConfig.update({ where: { id }, data: data });
            delete smtpConfig.pass;
            return smtpConfig;
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${id}`);
        }
    }

    async delete(orgId: string,id: string) {
        const prisma = await this.getPrismaClient(orgId);
        const existing = await prisma.orgSMTPConfig.findUnique({ where: { id } });
        if (existing) {
            return await prisma.orgSMTPConfig.delete({ where: { id } });
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${id}`);
        }
    }
}
