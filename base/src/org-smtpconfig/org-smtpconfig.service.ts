import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrgSmtpconfigDto } from './dto/create-org-smtpconfig.dto';
import { UpdateOrgSmtpconfigDto } from './dto/update-org-smtpconfig.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { SmtpService } from 'src/common/services/smtp.service';
import { HashingService } from 'src/common/services/hashing.service';

@Injectable()
export class OrgSmtpconfigService {

    constructor(
        private prisma: PrismaService,
        private organizationsService: OrganizationsService,
        private smtpService: SmtpService,
        private hashingService: HashingService,
    ) { }

    async create(createOrgSmtpconfigDto: CreateOrgSmtpconfigDto) {
        const organization = this.organizationsService.findOne(createOrgSmtpconfigDto.orgId)
        if (!organization) {
            throw new NotFoundException(`Org not found with id: ${createOrgSmtpconfigDto.orgId}`);
        }

        // verify connection
        const isConnectionOk = await this.smtpService.verifyConnection(createOrgSmtpconfigDto);

        if (!isConnectionOk) {
            throw new BadRequestException("Failed to establish a connection with the SMTP server. Please check your SMTP configuration and try again.");
        }

        createOrgSmtpconfigDto.pass = this.hashingService.encryt(createOrgSmtpconfigDto.pass);

        const existingConfigs = await this.getByOrg(createOrgSmtpconfigDto.orgId);
        if (existingConfigs.length == 0) {
            createOrgSmtpconfigDto = { ...createOrgSmtpconfigDto, ...{ isActive: true } };
        }
        const smtpConfig = await this.prisma.orgSMTPConfig.create({ data: createOrgSmtpconfigDto });
        delete smtpConfig.pass;
        return smtpConfig;
    }

    async findAll(orgId: string, paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const smtpConfigs = await this.prisma.orgSMTPConfig.findMany({
            where: { orgId },
            skip,
            take: limit,
        });
        const total = await this.prisma.orgSMTPConfig.count();
        return {
            data: smtpConfigs,
            page: page,
            total: total,
        };
    }

    async findOne(id: string) {
        const existing = await this.prisma.orgSMTPConfig.findUnique({ where: { id } });
        if (existing) {
            existing.pass = this.hashingService.decrypt(existing.pass);
            return existing;
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${id}`);
        }
    }

    async getByOrg(orgId: string) {
        const existing = await this.prisma.orgSMTPConfig.findMany({ where: { orgId } });
        if (existing) {
            return existing;
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${orgId}`);
        }
    }

    async getActiveConfigByOrg(orgId: string) {
        const existing = await this.prisma.orgSMTPConfig.findFirst({ where: { orgId, isActive: true } });
        if (existing) {
            return existing;
        }
        else {
            throw null;
        }
    }

    async update(id: string, updateOrgSmtpconfigDto: UpdateOrgSmtpconfigDto) {
        const existing = await this.prisma.orgSMTPConfig.findUnique({ where: { id } });
        if (existing) {
            // verify connection
            if(!updateOrgSmtpconfigDto.pass)
            {
                const pass = this.hashingService.decrypt(existing.pass);
                updateOrgSmtpconfigDto = {pass,...updateOrgSmtpconfigDto};
            }
            const isConnectionOk = await this.smtpService.verifyConnection(updateOrgSmtpconfigDto);

            if (!isConnectionOk) {
                throw new BadRequestException("Failed to establish a connection with the SMTP server. Please check your SMTP configuration and try again.");
            }
            updateOrgSmtpconfigDto.pass = this.hashingService.encryt(updateOrgSmtpconfigDto.pass);
            const smtpConfig = await this.prisma.orgSMTPConfig.update({ where: { id }, data: updateOrgSmtpconfigDto });
            delete smtpConfig.pass;
            return smtpConfig;
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${id}`);
        }
    }

    async delete(id: string) {
        const existing = await this.prisma.orgSMTPConfig.findUnique({ where: { id } });
        if (existing) {
            return await this.prisma.orgSMTPConfig.delete({ where: { id } });
        }
        else {
            throw new NotFoundException(`SMTP config not found with id: ${id}`);
        }
    }
}
