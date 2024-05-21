import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CTACreatorService } from 'src/assistants/services/cta-creator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CTAType } from 'src/common/enums/enums';
import { BaseService } from 'src/common/services/base.service';
import { CreateCTADto } from './dto/create-cta.dto';
import { SelectCTADto } from './dto/select-cta.dto';
import { UpdateCTADto } from './dto/update-cta.dto';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class CallToActionService extends BaseService {

    constructor(
        private readonly ctaCreator: CTACreatorService
    ) {
        super();
    }

    async create(serviceParams: ServiceParams<CreateCTADto>) {
        const { orgId, data: createCTADto } = serviceParams
        const prisma = await this.getPrismaClient(orgId);
        if (createCTADto.type !== CTAType.CALENDAR && !createCTADto.link) {
            throw new BadRequestException(`Link is required for ${createCTADto.type}`);
        }
        const ctaExisting = await prisma.callToAction.findFirst({ where: { name: createCTADto.name } });
        if (ctaExisting) {
            throw new NotAcceptableException(`CTA already exist with name ${createCTADto.name}`);
        }
        return await prisma.callToAction.create({ data: createCTADto });
    }

    async findAll(serviceParams: ServiceParams<PaginationDto>) {
        const { orgId, data: paginationDto } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await prisma.callToAction.findMany({ skip, take: limit });
        const total = await prisma.callToAction.count();

        return {
            data,
            page,
            total
        }
    }

    async find(serviceParams: ServiceParams<{ id: string }>) {
        const { orgId, data: { id } } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        const ctaExisting = await prisma.callToAction.findFirst({ where: { id } });
        if (!ctaExisting) {
            throw new NotFoundException(`CTA not found with id ${id}`);
        }
        return await prisma.callToAction.findUnique({ where: { id } });
    }

    async update(serviceParams: ServiceParams<{ id: string, updateCTADto: UpdateCTADto }>) {
        const { orgId, data: { id, updateCTADto } } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        const ctaExisting = await prisma.callToAction.findFirst({ where: { id } });
        if (!ctaExisting) {
            throw new NotFoundException(`CTA not found with id ${id}`);
        }
        return await prisma.callToAction.update({ where: { id }, data: updateCTADto });
    }

    async delete(serviceParams: ServiceParams<{ id: string }>) {
        const { orgId, data: { id } } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        const ctaExisting = await prisma.callToAction.findFirst({ where: { id } });
        if (!ctaExisting) {
            throw new NotFoundException(`CTA not found with id ${id}`);
        }
        return await prisma.callToAction.delete({ where: { id } });
    }

    async getCTAByLink(serviceParams: ServiceParams<{ link: string }>) {
        const { orgId, data: { link } } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        const cta = await prisma.callToAction.findFirst({ where: { link } });
        return cta;
    }

    async generateCTA(orgId: string) {
        return await this.ctaCreator.generateCTAs(orgId);
    }

    async selectCTA(serviceParams: ServiceParams<SelectCTADto[]>) {
        try {
            const { orgId, data: selectCTADto } = serviceParams;
            const createdCTAs = [];
            for (const cta of selectCTADto) {
                const existingCta = await this.getCTAByLink({ orgId, data: { link: cta.link } });
                if (existingCta) {
                    const updateCTADto = {
                        name: cta.label,
                        description: cta.text,
                        link: cta.link,
                        type: cta.type
                    }
                    const _cta = await this.update({ orgId, data: { id: existingCta.id, updateCTADto } });
                    createdCTAs.push(_cta);
                }
                else {
                    const createCTADto = {
                        name: cta.label,
                        description: cta.text,
                        link: cta.link,
                        type: CTAType.NAVIGATOR,
                    }
                    const _cta = await this.create({ orgId, data: createCTADto });
                    createdCTAs.push(_cta);
                }
            }
            return createdCTAs;
        }
        catch (error) {
            return error;
        }
    }
}
