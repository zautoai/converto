import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Response, HttpCode, Query } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Organization } from './entities/organization.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Organisations')
@ApiBearerAuth()
@Controller('api/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiCreatedResponse({type: Organization})
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return await this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiOkResponse({
    type: ResponseDTO<Organization>
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.organizationsService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE, SYSTEM_CONST.ADMIN_ROLE)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiOkResponse({
    type: Organization
  })
  async findOne(@Param('id') id: string) {
    return await this.organizationsService.findOne(id);
  }

  @Patch(':id') 
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE, SYSTEM_CONST.ADMIN_ROLE)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiOkResponse({type: Organization})
  @ApiResponse({ type: Organization })
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return await this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    return await this.organizationsService.remove(id);
  }

  @MessagePattern({cmd:'GET_ORGANIZATIONS'})
  async handleGetOrganizations(paginationDto: PaginationDto)
  {
    return await this.organizationsService.findAll(paginationDto);
  }
}
