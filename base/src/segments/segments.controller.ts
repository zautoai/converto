import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { ZautoRequest } from 'src/common/models/request.model';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Segments')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) { }

  @Post()
  async create(@Req() zautoRequest: ZautoRequest, @Body() createSegmentDto: CreateSegmentDto) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentsService.create(orgId, createSegmentDto);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get()
  async findAll(@Req() zautoRequest: ZautoRequest) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentsService.findAll(orgId);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get(':id')
  async findOne(@Req() zautoRequest: ZautoRequest, @Param('id') id: string) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentsService.findOne(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Patch(':id')
  async update(@Req() zautoRequest: ZautoRequest, @Param('id') id: string, @Body() updateSegmentDto: UpdateSegmentDto) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentsService.update(orgId, id, updateSegmentDto);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Delete(':id')
  async remove(@Req() zautoRequest: ZautoRequest, @Param('id') id: string) {
    if (zautoRequest.user && zautoRequest.user.org) {
      const orgId = zautoRequest.user.org.id;
      return await this.segmentsService.remove(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }
}
