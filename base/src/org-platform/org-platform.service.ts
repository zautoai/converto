import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrgPlatformDto } from './dto/create-orgPlatform.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreatePlatformDto } from 'src/platform/dto/create-platform.dto';

@Injectable()
export class OrgPlatformService 
{
    constructor(
        private readonly prisma:PrismaService,
    ){}

    async create(createOrgPlatfoDto:CreateOrgPlatformDto)
    {
        const isExist = await this.isPlatformExists(createOrgPlatfoDto.platformId);
        if(isExist)
        {
            try
            {
                const orgPlatform = await this.prisma.orgPlatform.create({data:createOrgPlatfoDto});
                return orgPlatform;
            }
            catch(error)
            {
                if(error instanceof PrismaClientKnownRequestError && error.code == 'P2002') {
                    throw new ConflictException("This Platform already selected for this org");
                }
                else
                {
                    throw new BadRequestException(error);
                }

            }

        }
        else
        {
            throw new NotFoundException(`Platform not found with id ${createOrgPlatfoDto.platformId}`);
        }
    }

    async createOther(createOrgPlatfoDto:CreateOrgPlatformDto)
    {
        const name = this.formateString(createOrgPlatfoDto.name);
        let existPlatform = await this.prisma.platform.findUnique({where: {name: name}})
        if(!existPlatform)
        {
            existPlatform = await this.prisma.platform.create({data:{name:name}});

        }
        try
        {
            const orgPlatform = await this.prisma.orgPlatform.create({data:{
                orgId: createOrgPlatfoDto.orgId,
                platformId: existPlatform.id
            }});
            return orgPlatform;
        }
        catch(error)
        {
            if(error instanceof PrismaClientKnownRequestError && error.code == 'P2002') {
                throw new ConflictException("This Platform already selected for this org");
            }
            else
            {
                throw new BadRequestException(error);
            }

        }
    }

    async findAll() {
        const orgPlatfoData = await this.prisma.orgPlatform.findMany({
            include: { platform: true },
            orderBy: { createdAt: 'desc' }
        });
        const total = await this.prisma.orgPlatform.count();
        return {
            data: orgPlatfoData,
            total: total
        };
    }

    async findAllByOrg(orgId: string)
    {
        const orgPlatfoData = await this.prisma.orgPlatform.findMany({
            where:{orgId},
            include:{platform:true}
        });
        const total = await this.prisma.orgPlatform.count();
        return {
            data:orgPlatfoData,
            total:total
        }
    }

    async findOne(id: string)
    {
        const orgPlatform = await this.prisma.orgPlatform.findUnique({where:{id},include:{platform:true}});
        if(orgPlatform)
        {
            return orgPlatform;
        }
        else
        {
            throw new NotFoundException(`OrgPlatform not found with id ${id}`);
        }
    }
    async update(id: string, updateOrgPlatformDto:CreateOrgPlatformDto)
    {
        const isPlatformExist = await this.isPlatformExists(updateOrgPlatformDto.platformId);
        if(isPlatformExist)
        {
            const existingOrgPlatform = await this.prisma.orgPlatform.findUnique({where:{id},include:{platform:true}});
            if(existingOrgPlatform)
            {
                return await this.prisma.orgPlatform.update({data:updateOrgPlatformDto,where:{id}});
            }
            else
            {
                throw new NotFoundException(`OrgPlatform not found with id ${id}`);
            }
        }
        else
        {
            throw new NotFoundException(`Platform not found with id ${updateOrgPlatformDto.platformId}`);
        }
        
    }

    async delete(id: string)
    {
        const isExist = await this.prisma.orgPlatform.findUnique({where:{id}});
        if(isExist)
        {
            return await this.prisma.orgPlatform.delete({where:{id}});
        }
        else
        {
            throw new NotFoundException(`OrgPlatform not found with id ${id}`);
        }
    }

    async isPlatformExists(platformId: string) {
        const platform = await this.prisma.platform.findUnique({where: {id: platformId}});
        if(platform) {
          return true;
        } return false;
    }

    formateString(str:string) {
        let processedStr = str.replace(/[^\w\s]/gi, '').replace(/\s/g, '');
        processedStr = processedStr.toLowerCase();
        return processedStr;
    }
}
