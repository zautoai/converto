import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class RolesService extends BaseService {

  constructor(
  ) {
    super();
  }

  async create(orgId: string, createRoleDto: CreateRoleDto) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingRole = await prisma.role.findFirst({ where: { name: createRoleDto.name } })
      if (!existingRole) {
        const roleData = await prisma.role.create({ data: createRoleDto });
        return roleData;
      } else {
        throw new ConflictException(`Role ${createRoleDto.name} already exist`);
      }
    } catch (error) {
      throw error
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId)
    }
  }

  async createDefaultRoles(orgId: string, roles: CreateRoleDto[]) {
    for (let role of roles) {
      await this.create(orgId, role);
    }
  }


  async findAll(orgId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const roleData = await prisma.role.findMany({ skip, take: limit });
      const total = await prisma.role.count();
      return {
        statusCode: 200,
        data: roleData,
        page: page,
        total: total
      };
    }
    catch (error) {
      throw error
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId)
    }
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const roleData = await prisma.role.findFirst({
        where: {
          id,
        }
      });
      if (roleData) {
        return roleData;
      } else {
        throw new NotFoundException(`Role not found with id ${id}`);
      }
    } catch (error) {
      throw error
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId)
    }
  }

  async findOneByName(orgId: string, name: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const roleData = await prisma.role.findFirst({
        where: {
          name,
        }
      });
      if (roleData) {
        return roleData;
      } else {
        throw new NotFoundException(`Role not found with id ${name}`);
      }
    } catch (error) {
      throw error
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId)
    }
  }

  async update(orgId: string, id: string, updateRoleDto: UpdateRoleDto) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingRole = await prisma.role.findFirst({ where: { id, } });
      if (existingRole) {
        const updatedRole = await prisma.role.update({
          data: updateRoleDto, where: {
            id,
          }
        })
        return updatedRole;
      } else {
        throw new NotFoundException(`Role not found with id ${id}`);
      }
    } catch (error) {
      throw error
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId)
    }

  }

  async remove(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingRole = await prisma.role.findFirst({ where: { id, } });
      console.log(existingRole)
      if (existingRole) {
        const result = await prisma.role.delete({
          where: { id },
        })
      } else {
        throw new NotFoundException(`Role not found with id ${id}`);
      }
    } catch (error) {
      throw error
    }
    finally {
      prisma.$disconnect()
      await this.closeConnection(orgId)
    }
  }
}
