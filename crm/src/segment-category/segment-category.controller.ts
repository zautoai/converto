import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';
import { SegmentCategoryService } from './segment-category.service';
import { CreateSegmentCategoryDto } from './dto/create-segment-category.dto';
import { UpdateSegmentCategoryDto } from './dto/update-segment-category.dto';

@ApiTags('Segment Category')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('segment-category')
export class SegmentCategoryController {
  constructor(private readonly segmentCategoryService: SegmentCategoryService) { }

  @Post()
  async create(@Body() createSegmentCategoryDto: CreateSegmentCategoryDto, @Req() request: IRequest,) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentCategoryService.create(orgId, createSegmentCategoryDto);

    } else {
      throw new UnauthorizedException("Unauthorised access.")
    }

  }

  @Get()
  async findAll(@Req() request: IRequest,) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentCategoryService.findAll(orgId);

    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get(':id')
  async findOne(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentCategoryService.findOne(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }


  @Patch(':id')
  async update(@Req() request: IRequest, @Param('id') id: string, @Body() updateSegmentCategoryDto: UpdateSegmentCategoryDto) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentCategoryService.update(orgId, id, updateSegmentCategoryDto);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Delete(':id')
  async remove(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentCategoryService.remove(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

}
