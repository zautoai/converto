import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, Req, UnauthorizedException } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Lead } from './entities/lead.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ZautoRequest } from 'src/common/models/request.model';


@ApiTags('Leads')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/leads')
export class LeadController {

  constructor(private readonly leadService: LeadService) { }

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto, @Req() request: ZautoRequest) {
    if (request && request.user && request.orgId) {
      return await this.leadService.create(createLeadDto, request.orgId);
    } else {
      throw new UnauthorizedException('Org info not found.')
    }
  }

  @Get()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(@Query() paginationDto: PaginationDto, @Req() zautoRequest: ZautoRequest) {
    if (zautoRequest.user && zautoRequest.orgId) {
      const orgId = zautoRequest.orgId;
      return await this.leadService.findAllByOrg(orgId, paginationDto);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }


  @Get(':id')
  @ApiOkResponse({ type: Lead })
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    return await this.leadService.findOne(id,orgId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Lead })
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto,@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    return await this.leadService.update(id,orgId, updateLeadDto);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    await this.leadService.remove(id,orgId);
  }
}
