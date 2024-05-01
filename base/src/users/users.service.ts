import { BadRequestException, ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RolesService } from 'src/roles/roles.service';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { UpdateProfilePicDto } from './dto/profile-pic-update.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StaticFileService } from 'src/common/services/static.service';
import { UsageService } from 'src/account/usage.service';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { OrgAccountService } from 'src/account/account.service';
import { CreateOrgAccountDto } from 'src/account/dto/create-account.dto';
import { OrgAccountStatus } from 'src/common/enums/enums';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {

  constructor(private prismaService: PrismaService,
    private rolesService: RolesService,
    private readonly staticFileService: StaticFileService,
    private readonly usageService: UsageService,
    private readonly orgAccountService: OrgAccountService) { }

  async updateUserCount(count: number, orgId: string) {
    const account = await this.prismaService.orgAccount.findFirst({
      where: { orgId }
    })
  }


  async create(createUserDto: CreateUserDto, verified: boolean = false) {
    const userUsage = await this.usageService.getUserCount(createUserDto.orgId);
    const remainingUser = userUsage.maxCount - userUsage.count;
    if (remainingUser <= 0) {
      throw new NotAcceptableException(`Remaining user ${remainingUser}`);
    }

    const existingUser = await this.prismaService.user.findFirst({
      where: { email: createUserDto.email }
    });
    if (!existingUser) {

      if (createUserDto.roleId != null && !await this.isRoleExist(createUserDto.roleId)) {
        throw new NotFoundException(`Role not found with id ${createUserDto.roleId}`);
      }
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );
      createUserDto.password = hashedPassword;
      if (!createUserDto.roleId) {
        let defaultRole = await this.rolesService.findOneByName(SYSTEM_CONST.DEFALT_ROLE);
        createUserDto.roleId = defaultRole.id;
      }
      const userData = await this.prismaService.user.create({ data: { ...createUserDto, verified } });
      delete userData.password;

      return userData;
    } else {
      throw new ConflictException(`User with ${createUserDto.email} already exists.`)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const userList = await this.prismaService.user.findMany({select: {
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
    const userList = await this.prismaService.
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
    const total = await this.prismaService.user.count({where: {orgId}});
    return {
      data: userList,
      page: page,
      total: total,
    }
  }

  async findOne(id: string) {
    const userData = await this.prismaService.user.findFirst({
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
        org: true
      },
    })
    if (userData) {
      return userData
    } else {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userData = await this.prismaService.user.findFirst({
      where: { id, }
    });
    if (userData) {
      if (updateUserDto.roleId != null && !await this.isRoleExist(updateUserDto.roleId)) {
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
      const updatedUserData = await this.prismaService.user.update({data: updateUserDto, where:{id,}});
      return updatedUserData;
    } else {
      throw new NotFoundException(`User not found with id ${id}`);
    }
  }

  async updateProfilePicUrl(id: string, updateProfilePicDto: UpdateProfilePicDto) {
    const userData = await this.prismaService.user.findFirst({
      where: { id, },
    });
    if (userData) {
      const updatedUserData = await this.prismaService.user.update({ data: updateProfilePicDto, where: { id, } });
      await this.staticFileService.deleteExistingFile(userData.imgUrl);
      return updatedUserData;
    } else {
      throw new NotFoundException(`User not found with id ${id}`);
    }
  }

  async remove(id: string) {
    const userData = await this.prismaService.user.findFirst({
      where: { id, }
    });
    if (userData) {
      return await this.prismaService.user.delete({ where: { id, } });
    } else {
      throw new NotFoundException(`User not found with id ${id}`);
    }
  }

  async isRoleExist(id: string) {
    const roleData = await this.prismaService.role.findFirst({
      where: { id, }
    })
    if (roleData) {
      return true;
    }
    return false;
  }

  async getUserById(id: string) {
    const userData = await this.prismaService.user.findFirst({
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
        org: true
      },
    });
    return userData;
  }

  async findByEmail(email: string) {
    return await this.prismaService.user.findFirst({ where: { email }, include: { role: true, org: true } });
  }

  async changePassword(id: string, password: string) {
    const hashedPassword = await bcrypt.hash(
      password,
      roundsOfHashing,
    );
    password = hashedPassword;
    await this.prismaService.user.update({ data: { password }, where: { id } });
  }

  async verifyEmail(userId: string) {
    return await this.prismaService.user.update({ data: { verified: true }, where: { id: userId } });
  }
}
