import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';


@ApiTags('Segments')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) { }

  @Post()
  async create(@Req() request: IRequest, @Body() createSegmentDto: CreateSegmentDto) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentsService.create(orgId, createSegmentDto);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get()
  async findAll(@Req() request: IRequest) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentsService.findAll(orgId);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get(':id')
  async findOne(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentsService.findOne(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Patch(':id')
  async update(@Req() request: IRequest, @Param('id') id: string, @Body() updateSegmentDto: UpdateSegmentDto) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentsService.update(orgId, id, updateSegmentDto);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Delete(':id')
  async remove(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      const orgId = request.orgId;
      return await this.segmentsService.remove(orgId, id);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }
}
