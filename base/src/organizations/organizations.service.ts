import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DEFALT_ROLES, DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BaseService } from 'src/common/services/base.service';
import { SchemaManagerService } from 'src/microservices/crm_service/schema-manager.service';
import { RolesService } from 'src/roles/roles.service';
import { SchemaManager } from 'src/schema-manager/schema-manager.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SegmentsService } from 'src/segments/segments.service';
import { SegmentCategoryService } from 'src/segment-category/segment-category.service';
import { SEGMENT, SEGMENT_CATEGORY } from 'src/common/constants/segments.constant';
import { StartupMicroService } from 'src/microservices/crm_service/startup.service';
import { IcpMicroService } from 'src/microservices/crm_service/icp.service';
import { INBOUND, OUTBOUND } from 'src/common/constants/icp.constant';


@Injectable()
export class OrganizationsService extends BaseService {


  constructor(
    private readonly schemaManagerService: SchemaManagerService,
    private readonly schemaManager: SchemaManager,
    private readonly roleService: RolesService,
    private segmentService: SegmentsService,
    private segmentCategoryService: SegmentCategoryService,
    private startupMicroService: StartupMicroService,
    private icpMicroService: IcpMicroService
  ) {
    super();
  }

  async findOrgByEmail(email: string) {
    const prisma = await this.getPrismaMasterClient();
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
      prisma.$disconnect()
      await this.closeMasterConnection();
    }
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    const prisma = await this.getPrismaMasterClient()
    try {
      const organization = await prisma.organization.create({ data: createOrganizationDto });

      if (organization) {
        try {
          await this.schemaManager.create(organization.id, null);
          await this.createDefaultRoles(organization.id);
          await this.startupMicroService.syncSingleOrganization(organization.id)
          await this.createDefaultSegment(organization.id);
          await this.createDefaultIcp(organization.id);
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
      prisma.$disconnect()
      await this.closeMasterConnection();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaMasterClient()
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
      prisma.$disconnect()
      await this.closeMasterConnection();
    }
  }

  async findOne(id: string) {
    const prisma = await this.getPrismaMasterClient()
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
      prisma.$disconnect()
      await this.closeMasterConnection();
    }
  }


  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const prisma = await this.getPrismaMasterClient()
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
      prisma.$disconnect()
      await this.closeMasterConnection();
    }
  }

  async remove(id: string) {
    const prisma = await this.getPrismaMasterClient()
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
      prisma.$disconnect()
      await this.closeMasterConnection();
    }
  }

  async findOneByName(orgName: string) {
    const prisma = await this.getPrismaMasterClient()
    try {
      const org = await prisma.organization.findFirst({ where: { name: orgName } });
      return org
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeMasterConnection();
    }
  }

  async updateOrgWith(id: string, name: string, siteUrl: string) {
    const prisma = await this.getPrismaMasterClient()
    try {
      return await prisma.organization.update({ data: { name, siteUrl }, where: { id } });
    }
    catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
    finally {
      prisma.$disconnect()
      await this.closeMasterConnection();
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

  async createDefaultSegment(orgId: string) {
    const segmentCategory = SEGMENT_CATEGORY;
    let segmentCategoryIds = {}
    for (let category of segmentCategory) {
      let createdSegmentCategory = await this.segmentCategoryService.create(orgId, category);
      segmentCategoryIds[category.name] = createdSegmentCategory.data.id;
    }
    console.log(segmentCategoryIds);

    const segments = SEGMENT;
    for (let segmentType in segments) {
      const segmentArray = segments[segmentType];
      for (let segment of segmentArray) {
        const createSegmentDto = {
          name: segment.name,
          description: segment.description,
          segmentCategoryId: segmentCategoryIds[segmentType]
        };
        await this.segmentService.create(orgId, createSegmentDto);
      }
    }
  }

  async createDefaultIcp(orgId: string) {
    await this.icpMicroService.createIcp(orgId, INBOUND);
    await this.icpMicroService.createIcp(orgId, OUTBOUND);
  }

}
