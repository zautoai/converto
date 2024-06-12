import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('segment')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) { }

  @Post()
  async create(@Body() createSegmentDto: CreateSegmentDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentsService.create(orgId, createSegmentDto);
  }

  @Get()
  async findAll(@Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentsService.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentsService.findOne(orgId, id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSegmentDto: UpdateSegmentDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentsService.update(orgId, id, updateSegmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentsService.remove(orgId, id);
  }
}
