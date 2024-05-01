import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class RolesService {

  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    console.log(createRoleDto);
    const existingRole = await this.prisma.role.findFirst({where: {name: createRoleDto.name}})
    if(!existingRole) {
      const roleData = await this.prisma.role.create({data: createRoleDto});
      return roleData;
    } else {
      throw new ConflictException(`Role ${createRoleDto.name} already exist`);
    }
  }

  async createDefaultRoles(roles: CreateRoleDto[]) {
    for(let role of roles) {
      await this.create(role);
    }
  }
  

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await this.prisma.role.findMany({skip, take: limit});
    const total = await this.prisma.role.count();
    return {
      statusCode: 200,
      data: roleData,
      page: page,
      total: total
    };
  }

  async findOne(id: string) {
    const roleData = await this.prisma.role.findFirst({
        where: {
          id,
      }
    });
    if(roleData) {
      return roleData;
    } else {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
  }

  async findOneByName(name: string) {
    const roleData = await this.prisma.role.findFirst({
        where: {
          name,
      }
    });
    if(roleData) {
      return roleData;
    } else {
      throw new NotFoundException(`Role not found with id ${name}`);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const existingRole = await this.prisma.role.findFirst({where: {id,}});
    if(existingRole) {
      const updatedRole = await this.prisma.role.update({data: updateRoleDto, where: {
        id,
      }})
      return updatedRole;
    } else {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
    
  }

  async remove(id: string) {
    const existingRole = await this.prisma.role.findFirst({where: {id,}});
    console.log(existingRole)
    if(existingRole) {
      const result = await this.prisma.role.delete({
        where: {id},
      })
    } else {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
  }
}
