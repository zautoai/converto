import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { take } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {CreatePlatformDto} from 'src/platform/dto/create-platform.dto';
import { Platform } from './entities/platform.entity';

@Injectable()
export class PlatformService {

    constructor(private readonly prisma:PrismaService)
    {

    }

    async create(createPlatformDto: CreatePlatformDto)
    {        
        const name = this.formateString(createPlatformDto.name);
        const existPlatform = await this.isPlatformExists(name);
        if(existPlatform)
        {
            return existPlatform;
        }
        else
        {
            createPlatformDto.name = name;
            return await this.prisma.platform.create({data:createPlatformDto}); 
        }
    }

    async findAll()
    {

        const platformData = await this.prisma.platform.findMany();
        const total = await this.prisma.platform.count();
        return {
            data:platformData,
            total:total
        }
    }

    async findOne(id: string)
    {
        const platform = await this.prisma.platform.findUnique({where:{id}});
        if(platform)
        {
            return platform;
        }
        else
        {
            throw new NotFoundException(`Platform not found with id ${id}`);
        }
    }

    async update(id: string,updatePlateformDto: CreatePlatformDto)
    {
        const existingPlatform = await this.prisma.platform.findUnique({where:{id}});
        if(existingPlatform)
        {
            const name = this.formateString(updatePlateformDto.name);
            updatePlateformDto.name = name;
            return await this.prisma.platform.update({data:updatePlateformDto,where:{id}});
        }
        else
        {
            throw new NotFoundException(`Platform not found with id ${id}`);
        }
    }

    async delete(id: string)
    {
        const existingPlatform = await this.prisma.platform.findUnique({where:{id}});
        if(existingPlatform)
        {

            return await this.prisma.platform.delete({where:{id}});
        }
        else
        {
            throw new NotFoundException(`Platform not found with id ${id}`);
        }
    }

    async createDefaultPlatforms(platfoms: CreatePlatformDto[]) {
        for(let platform of platfoms) {
          await this.create(platform); 
        }
      }

    async isPlatformExists(name: string) {
        const platform = await this.prisma.platform.findFirst({where: {name: name}});
        return platform;
    }

    formateString(str:string) {
        let processedStr = str.replace(/[^\w\s]/gi, '').replace(/\s/g, '');
        processedStr = processedStr.toLowerCase();
        return processedStr;
    }
}
