import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { SegmentGroupService } from './segment-group.service';
import { CreateSegmentGroupDto } from './dto/create-segment-group.dto';
import { UpdateSegmentGroupDto } from './dto/update-segment-group.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { RolesGuard } from 'src/auth/roles.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('Segment Group')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('segment-group')
export class SegmentGroupController {
  constructor(private readonly segmentGroupService: SegmentGroupService) { }

  @Post()
  async create(@Body() createSegmentGroupDto: CreateSegmentGroupDto, @Req() zautoRequest: ZautoRequest) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentGroupService.create(orgId, createSegmentGroupDto);

    } else {
      throw new UnauthorizedException("Unauthorised access.")
    }

  }

  @Get()
  async findAll(@Req() zautoRequest: ZautoRequest) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentGroupService.findAll(orgId);

    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get(':id')
  async findOne(@Req() zautoRequest: ZautoRequest, @Param('id') id: string) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentGroupService.findOne(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }


  @Patch(':id')
  async update(@Req() zautoRequest: ZautoRequest, @Param('id') id: string, @Body() updateSegmentGroupDto: UpdateSegmentGroupDto) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentGroupService.update(orgId, id, updateSegmentGroupDto);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Delete(':id')
  async remove(@Req() zautoRequest: ZautoRequest, @Param('id') id: string) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentGroupService.remove(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

}
