import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from './entities/role.entity';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';

@Controller('api/roles')
@ApiTags('Roles')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiBody({ type: CreateRoleDto })
  @ApiCreatedResponse({type: Role})
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiResponse({
    type: ResponseDTO<Role>
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.rolesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOkResponse({type: Role})
  async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({type: Role})
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
  }
}
