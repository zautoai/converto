import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { SegmentCategoryService } from './segment-category.service';
import { CreateSegmentCategoryDto } from './dto/create-segment-category.dto';
import { UpdateSegmentCategoryDto } from './dto/update-segment-category.dto';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('segment-category')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/segment-category')
export class SegmentCategoryController {
  constructor(private readonly segmentCategoryService: SegmentCategoryService) { }

  @Post()
  async create(@Body() createSegmentCategoryDto: CreateSegmentCategoryDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentCategoryService.create(orgId, createSegmentCategoryDto);
  }

  @Get()
  async findAll(@Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    console.log("Send from controller");

    return await this.segmentCategoryService.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentCategoryService.findOne(orgId, id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSegmentCategoryDto: UpdateSegmentCategoryDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentCategoryService.update(orgId, id, updateSegmentCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.segmentCategoryService.remove(orgId, id);
  }
}
