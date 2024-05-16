import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CrmService } from 'src/crm/crm.service';
import { SchemaManagerService } from 'src/microservices/crm_service/schema-manager.service';
import { SchemaManager } from 'src/schema-manager/schema-manager.service';


@Injectable()
export class OrganizationsService {
 

  constructor(
    private prisma: PrismaService,
    private readonly schemaManagerService: SchemaManagerService,
    private readonly schemaManager: SchemaManager
  ){}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const organization = await this.prisma.organization.create({data: createOrganizationDto});
    if(organization) {
      try
      {
        await this.schemaManager.create(organization.id,null);
        await this.schemaManagerService.create(organization.id, organization.name);
      }
      catch(e)
      {
        console.log(e);
      }
    }
    return organization 
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await this.prisma.organization.findMany({skip, take: limit});
    const total = await this.prisma.organization.count();
    return {
      statusCode: 200,
      data: roleData, 
      page: page,
      total: total
    };
  }

  async findOne(id: string) {
    let org = await this.prisma.organization.findFirst({where: {id}});
    if(org) {
        return org;
    } else {
      throw new NotFoundException(`Organization not found with id ${id}`);
    }
  }
  

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    let org = await this.prisma.organization.findFirst({where: {id}});
    if(org) { 
        return await this.prisma.organization.update({data: updateOrganizationDto, where: {id}});
    } else {
      throw new NotFoundException(`Organization not found with id ${id}`);
    }
  }

  async remove(id: string) {
    let org = await this.prisma.organization.findFirst({where: {id,}});
    if(org) {  
        if(org) {
          try
          {
            await this.schemaManagerService.delete(org.id);
          }
          catch(e)
          {
            console.log(e);
          }
        }
        return await this.prisma.organization.delete({where: {id}});
    } else {
      throw new NotFoundException(`Organization not found with id ${id}`);
    }
  }

  findOneByName(orgName: string) {
    return this.prisma.organization.findFirst({where: {name: orgName}});
  }

  async updateOrgWith(id: string, name: string, siteUrl: string) {
    return await this.prisma.organization.update({data: {name, siteUrl}, where: {id}});
  }
}
