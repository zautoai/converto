import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SchemaManagerService } from 'src/microservices/crm_service/schema-manager.service';
import { SchemaManager } from 'src/schema-manager/schema-manager.service';
import { DEFALT_ROLES, DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';
import { PrismaClientManager } from 'src/prisma/prisma-client-manager.service';
import { RolesService } from 'src/roles/roles.service';


@Injectable()
export class OrganizationsService {


  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly schemaManagerService: SchemaManagerService,
    private readonly schemaManager: SchemaManager,
    private readonly roleService: RolesService
  ) { }

  async findOrgByEmail(email: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      const org = await prisma.organization.findFirst({
        where: {
          emails: {
            hasSome: [email]
          }
        }
      })
      return org
    } catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      const organization = await prisma.organization.create({ data: createOrganizationDto });

      if (organization) {
        try {
          await this.schemaManager.create(organization.id, null);
          await this.createDefaultRoles(organization.id);
          // await this.schemaManagerService.create(organization.id, organization.name);
        }
        catch (e) {
          throw e
        }
      }
      return organization
    } catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      const roleData = await prisma.organization.findMany({ skip, take: limit });
      const total = await prisma.organization.count();
      return {
        statusCode: 200,
        data: roleData,
        page: page,
        total: total
      };
    }
    catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }

  async findOne(id: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      let org = await prisma.organization.findFirst({ where: { id } });
      if (org) {
        return org;
      } else {
        throw new NotFoundException(`Organization not found with id ${id}`);
      }
    } catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }


  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      let org = await prisma.organization.findFirst({ where: { id } });
      if (org) {
        const org = await prisma.organization.update({ data: updateOrganizationDto, where: { id } });
        return org
      } else {
        throw new NotFoundException(`Organization not found with id ${id}`);
      }
    } catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }

  async remove(id: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      let org = await prisma.organization.findFirst({ where: { id, } });
      if (org) {
        try {
          await this.schemaManagerService.delete(org.id);
        }
        catch (e) {
          throw e
        }
        const _org = await prisma.organization.delete({ where: { id } });
        return _org
      } else {
        throw new NotFoundException(`Organization not found with id ${id}`);
      }
    } catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }

  async findOneByName(orgName: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      const org = await prisma.organization.findFirst({ where: { name: orgName } });
      return org
    } catch (error) {
      throw error
    } finally {
      await prisma.$disconnect();
    }
  }

  async updateOrgWith(id: string, name: string, siteUrl: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      return await prisma.organization.update({ data: { name, siteUrl }, where: { id } });
    }
    catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
    finally {
      await prisma.$disconnect();
    }
  }

  async createDefaultRoles(orgId: string) {
    const defaultRoles = DEFALT_ROLES;
    try {
      await this.roleService.createDefaultRoles(orgId, defaultRoles);
    } catch (error) {
      console.error('Defailt role not created, mybe it got created already.')
    }
  }
}
