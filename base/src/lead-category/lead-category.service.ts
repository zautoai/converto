import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { take } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeadCategoryDto } from './dto/create-platform.dto';
import { ZautoRequest } from 'src/common/models/request.model';

@Injectable()
export class LeadCategoryService {

    constructor(private readonly prisma:PrismaService)
    {

    }

    async create(createLeadCategory: CreateLeadCategoryDto, zautoRequest: ZautoRequest)
    {        
        const existingCategory = await this.isCategoryExist(createLeadCategory, zautoRequest);
        if(existingCategory)
        {
            throw new ConflictException("Category already exist.");
        }
        else
        {
            let name = this.formateString(createLeadCategory.title);
            return await this.prisma.leadCategory.create({data: {...createLeadCategory, name, orgId: zautoRequest.user.org.id}}); 
        }
    }

    async isCategoryExist(createLeadCategory: CreateLeadCategoryDto, zautoRequest: ZautoRequest)
    {        
        const name = this.formateString(createLeadCategory.title);
        const existingCategory = await this.prisma.leadCategory.findFirst({where:{name, orgId: zautoRequest.user.org.id}});
        return existingCategory; 
    }


    async findAll()
    {

        const platformData = await this.prisma.leadCategory.findMany();
        const total = await this.prisma.leadCategory.count();
        return {
            data:platformData,
            total:total
        }
    }

    async findAllByOrg(orgId: string, paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const sites = await this.prisma.leadCategory.findMany({
          skip,
          take: limit,
          where: { orgId }
        });
        const total = await this.prisma.leadCategory.count({ where: { orgId } });
        return {
          data: sites,
          page: page,
          total: total,
        };
      }

    async findOne(id: string)
    {
        const leadCategory = await this.prisma.leadCategory.findUnique({where:{id}});
        if(leadCategory)
        {
            return leadCategory;
        }
        else
        {
            throw new NotFoundException(`leadCategory not found with id ${id}`);
        }
    }

    async update(id: string,updatePlateformDto: CreateLeadCategoryDto)
    {
        const existingPlatform = await this.prisma.leadCategory.findUnique({where:{id}});
        if(existingPlatform)
        {
            const name = this.formateString(updatePlateformDto.title);
            return await this.prisma.leadCategory.update({data:{...updatePlateformDto, name},where:{id}});
        }
        else
        {
            throw new NotFoundException(`leadCategory not found with id ${id}`);
        }
    }

    async delete(id: string)
    {
        const existingPlatform = await this.prisma.leadCategory.findUnique({where:{id}});
        if(existingPlatform)
        {

            return await this.prisma.leadCategory.delete({where:{id}});
        }
        else
        {
            throw new NotFoundException(`leadCategory not found with id ${id}`);
        }
    }

    formateString(str:string) {
        let processedStr = str.replace(/[^\w\s]/gi, '').replace(/\s/g, '');
        processedStr = processedStr.toLowerCase();
        return processedStr;
    }
}
