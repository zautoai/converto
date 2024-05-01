import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrgAccountService } from './account.service';
import { CreateOrgAccountDto } from './dto/create-account.dto';
import { UpdateOrgAccountDto } from './dto/update-account.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Accounts')
@Controller('api/accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrgAccountController {
  constructor(private readonly orgAccountService: OrgAccountService) {}

  @Post()
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new organization account' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: CreateOrgAccountDto })
  async create(@Body() createOrgAccountDto: CreateOrgAccountDto) {
    return this.orgAccountService.create(createOrgAccountDto);
  }

  @Get()
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Retrieve all organization accounts' })
  @ApiResponse({ status: 200, description: 'Array of organization accounts.', type: [CreateOrgAccountDto] })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.orgAccountService.findAll(paginationDto);
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Retrieve a specific organization account' })
  @ApiResponse({ status: 200, description: 'The organization account.', type: CreateOrgAccountDto })
  async findOne(@Param('orgId') orgId: string) {
    return this.orgAccountService.findOne(orgId);
  }

  @Patch(':orgId')
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a specific organization account' })
  @ApiResponse({ status: 200, description: 'The updated organization account.', type: UpdateOrgAccountDto })
  async update(@Param('orgId') orgId: string, @Body() updateOrgAccountDto: UpdateOrgAccountDto) {
    return this.orgAccountService.update(orgId, updateOrgAccountDto);
  }

  @Delete(':orgId')
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a specific organization account' })
  @ApiResponse({ status: 204, description: 'The organization account has been successfully deleted.' })
  async remove(@Param('orgId') orgId: string) {
    return this.orgAccountService.remove(orgId);
  }
}
