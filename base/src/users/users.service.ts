import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RolesService } from 'src/roles/roles.service';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { UpdateProfilePicDto } from './dto/profile-pic-update.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StaticFileService } from 'src/common/services/static.service';
import { BaseService } from 'src/common/services/base.service';


export const roundsOfHashing = 10;

@Injectable()
export class UsersService extends BaseService{

  constructor(
    private rolesService: RolesService,
    private readonly staticFileService: StaticFileService,
  ) {
    super();
   }


  async create(orgId: string,createUserDto: CreateUserDto, verified: boolean = false) {
    const prisma = await this.getPrismaClient(orgId);
    const existingUser = await prisma.user.findFirst({
      where: { email: createUserDto.email }
    });
    if (!existingUser) {

      if (createUserDto.roleId != null && !await this.isRoleExist(orgId,createUserDto.roleId)) {
        throw new NotFoundException(`Role not found with id ${createUserDto.roleId}`);
      }
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );
      createUserDto.password = hashedPassword;
      if (!createUserDto.roleId) {
        let defaultRole = await this.rolesService.findOneByName(orgId,SYSTEM_CONST.DEFALT_ROLE);
        createUserDto.roleId = defaultRole.id;
      }
      const userData = await prisma.user.create({ data: { ...createUserDto, verified } });
      delete userData.password; 

      return userData;
    } else {
      throw new ConflictException(`User with ${createUserDto.email} already exists.`)
    }
  }

  async findAll(orgId: string,paginationDto: PaginationDto) {
    const prisma = await this.getPrismaClient(orgId);
    const userList = await prisma.user.findMany({select: {
      id: true,
      name: true,
      email: true,
      imgUrl: true,
      createdAt: true,
      modifiedAt: true,
      role: {
        // Include specific fields from the related role model
        select: {
          id: true,
          name: true,
        },
      },
    }});
    return {
      statusCode: 200,
      data: userList
    }
  }

  async findAllByOrg(paginationDto: PaginationDto, orgId: string) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaClient(orgId);
    const userList = await prisma.
    user.findMany({
      skip, take: limit,
      select: {
      id: true,
      name: true,
      email: true,
      imgUrl: true,
      createdAt: true,
      modifiedAt: true,
      role: {
        // Include specific fields from the related role model
        select: {
          id: true,
          name: true,
        },
      },
    }, where: {orgId}});
    const total = await prisma.user.count({where: {orgId}});
    return {
      data: userList,
      page: page,
      total: total,
    }
  }

  async findOne(orgId: string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const userData = await prisma.user.findFirst({
      where: { id, }, select: {
        id: true,
        name: true,
        imgUrl: true,
        email: true,
        verified: true,
        createdAt: true,
        modifiedAt: true,
        orgId: true,
        role: {
          // Include specific fields from the related role model
          select: {
            id: true,
            name: true,
            createdAt: true,
            modifiedAt: true,
          },
        },
      },
    })
    if (userData) {
      return userData
    } else {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
  }

  async update(orgId: string,id: string, updateUserDto: UpdateUserDto) {
    const prisma = await this.getPrismaClient(orgId);
    const userData = await prisma.user.findFirst({
      where: { id, }
    });
    if (userData) {
      if (updateUserDto.roleId != null && !await this.isRoleExist(orgId,updateUserDto.roleId)) {
        throw new NotFoundException(`Role not found with id ${updateUserDto.roleId}`);
      } else {
        updateUserDto.roleId = userData.roleId;
      }
      if(updateUserDto.password.length > 0)
      {
        const hashedPassword = await bcrypt.hash(
          updateUserDto.password,
          roundsOfHashing,
        );
        updateUserDto.password = hashedPassword;
      }
      const updatedUserData = await prisma.user.update({data: updateUserDto, where:{id,}});
      return updatedUserData;
    } else {
      throw new NotFoundException(`User not found with id ${id}`);
    }
  }

  async updateProfilePicUrl(orgId:string,id: string, updateProfilePicDto: UpdateProfilePicDto) {
    const prisma = await this.getPrismaClient(orgId);
    const userData = await prisma.user.findFirst({
      where: { id, },
    });
    if (userData) {
      const updatedUserData = await prisma.user.update({ data: updateProfilePicDto, where: { id, } });
      await this.staticFileService.deleteExistingFile(userData.imgUrl);
      return updatedUserData;
    } else {
      throw new NotFoundException(`User not found with id ${id}`);
    }
  }

  async remove(orgId: string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const userData = await prisma.user.findFirst({
      where: { id, }
    });
    if (userData) {
      return await prisma.user.delete({ where: { id, } });
    } else {
      throw new NotFoundException(`User not found with id ${id}`);
    }
  }

  async isRoleExist(orgId: string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const roleData = await prisma.role.findFirst({
      where: { id, }
    })
    if (roleData) {
      return true;
    }
    return false;
  }

  async getUserById(orgId: string,id: string) {
    const prisma = await this.getPrismaClient(orgId);
    const userData = await prisma.user.findFirst({
      where: { id, }, select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return userData;
  }

  async findByEmail(orgId: string,email: string) {
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.user.findFirst({ where: { email }, include: { role: true } });
  }

  async changePassword(orgId: string,id: string, password: string) {
    const prisma = await this.getPrismaClient(orgId);
    const hashedPassword = await bcrypt.hash(
      password,
      roundsOfHashing,
    );
    password = hashedPassword;
    await prisma.user.update({ data: { password }, where: { id } });
  }

  async verifyEmail(orgId: string,userId: string) {
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.user.update({ data: { verified: true }, where: { id: userId } });
  }
}
