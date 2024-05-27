import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { IcpService } from './icp.service';
import { CreateIcpDto } from './dto/create-icp.dto';
import { UpdateIcpDto } from './dto/update-icp.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';

@ApiTags('ICP')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('icp')
export class IcpController {
  constructor(private readonly icpService: IcpService) { }

  @Post()
  async create(@Req() request: IRequest, @Body() createIcpDto: CreateIcpDto) {
    if (request.orgId) {
      const orgId = request.orgId;
      return this.icpService.create(orgId, createIcpDto);
    } else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get()
  async findAll(@Req() request: IRequest) {
    if (request.orgId) {
      const orgId = request.orgId;
      return this.icpService.findAll(orgId);
    } else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get(':id')
  findOne(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      const orgId = request.orgId;
      return this.icpService.findOne(orgId, id);
    } else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Patch(':id')
  async update(@Req() request: IRequest, @Param('id') id: string, @Body() updateIcpDto: UpdateIcpDto) {
    if (request.orgId) {
      const orgId = request.orgId;
      return this.icpService.update(orgId, id, updateIcpDto);
    } else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Delete(':id')
  async remove(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.icpService.remove(orgId, id);
    } else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }
}
