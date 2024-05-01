import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCTADto } from './dto/create-cta.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateCTADto } from './dto/update-cta.dto';
import { CTACreatorService } from 'src/assistants/services/cta-creator';
import { SelectCTADto } from './dto/select-cta.dto';
import { CTAType } from 'src/common/enums/enums';

@Injectable()
export class CallToActionService {

    constructor (
        private readonly prisma: PrismaService,
        private readonly ctaCreator: CTACreatorService
    ){}

    async create(createCTADto: CreateCTADto)
    {
        if(createCTADto.type !== CTAType.CALENDAR && !createCTADto.link) {
            throw new BadRequestException(`Link is required for ${createCTADto.type}`);
        }
        const ctaExisting = await this.prisma.callToAction.findFirst({where:{name: createCTADto.name}});
        if(ctaExisting)
        {
            throw new NotAcceptableException(`CTA already exist with name ${createCTADto.name}`);
        }
        const agent = await this.prisma.agent.findFirst({where:{orgId: createCTADto.orgId}});
        if(!agent)
        {
            throw new NotFoundException(`Agent not found for this organization`);
        }
        createCTADto.agentId = agent.id;
        return await this.prisma.callToAction.create({data:createCTADto});
    }

    async findAll(orgId: string,paginationDto: PaginationDto)
    {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.prisma.callToAction.findMany({ where:{orgId},skip, take: limit });
        const total = await this.prisma.callToAction.count({where:{orgId}});

        return {
            data,
            page,
            total
        }
    }

    async find(id: string)
    {
        const ctaExisting = await this.prisma.callToAction.findFirst({where:{id}});
        if(!ctaExisting)
        {
            throw new NotFoundException(`CTA not found with id ${id}`);
        }
        return await this.prisma.callToAction.findUnique({where:{id}});
    }

    async update(id: string, updateCTADto: UpdateCTADto)
    {
        const ctaExisting = await this.prisma.callToAction.findFirst({where:{id}});
        if(!ctaExisting)
        {
            throw new NotFoundException(`CTA not found with id ${id}`);
        }
        return await this.prisma.callToAction.update({where:{id},data:updateCTADto});
    }

    async delete(id: string)
    {
        const ctaExisting = await this.prisma.callToAction.findFirst({where:{id}});
        if(!ctaExisting)
        {
            throw new NotFoundException(`CTA not found with id ${id}`);
        }
        return await this.prisma.callToAction.delete({where:{id}});
    }

    async getCTAByLink(orgId:string,link:string)
    {
        const cta = await this.prisma.callToAction.findFirst({where:{link,orgId}});
        return cta;
    }

    async generateCTA(orgId:string)
    {
        const agent = await this.prisma.agent.findFirst({where:{orgId}});
        if(!agent)
        {
            throw new NotFoundException('agent not found');
        }
        return await this.ctaCreator.generateCTAs(agent.id);
    }

    async selectCTA(orgId: string,selectCTADto: SelectCTADto[])
    {
        try{
            const agent = await this.prisma.agent.findFirst({where:{orgId: orgId}});
            if(!agent)
            {
                throw new NotFoundException(`Agent not found for this organization`);
            }
            const createdCTAs = [];
            for(const cta of selectCTADto)
            {
                
                const existingCta = await this.getCTAByLink(orgId,cta.link);
                if(existingCta)
                {
                    const updateCTADto ={
                        name : cta.label,
                        description : cta.text,
                        link : cta.link,
                        type : cta.type
                    }
                    const _cta = await this.update(existingCta.id,updateCTADto);
                    createdCTAs.push(_cta);
                }
                else
                {
                    const createCTADto = {
                        orgId : orgId,
                        agentId : agent.id,
                        name : cta.label,
                        description : cta.text,
                        link : cta.link,
                        type : CTAType.NAVIGATOR,
                    }
                    const _cta = await this.create(createCTADto);
                    createdCTAs.push(_cta);
                }
            }
            return createdCTAs;
        }
        catch(error)
        {
            return error;
        }
    }
}
