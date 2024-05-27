import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { IcpService } from './icp.service';
import { CreateIcpDto } from './dto/create-icp.dto';
import { UpdateIcpDto } from './dto/update-icp.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('ICP')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/icp')
export class IcpController {
  constructor(private readonly icpService: IcpService) { }

  @Post()
  async create(@Body() createIcpDto: CreateIcpDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.icpService.create(orgId, createIcpDto);
  }

  @Get()
  async findAll(@Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.icpService.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.icpService.findOne(orgId, id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateIcpDto: UpdateIcpDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.icpService.update(orgId, id, updateIcpDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.icpService.remove(orgId, id);
  }
}
