import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, Req, UnauthorizedException } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Visitor } from './entities/visitor.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ZautoRequest } from 'src/common/models/request.model';


@ApiTags('Visitors')
@Controller('api/visitors')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Post()
  async create(@Body() createVisitorDto: CreateVisitorDto, @Req() request: ZautoRequest) {
    if(request.user && request.user.orgId) {
      const orgId = request.user.orgId;
      return await this.visitorService.create({ orgId, data: createVisitorDto});
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
    @ApiOkResponse({
      type: ResponseDTO<Visitor>
    })
    async findAll(@Query() paginationDto: PaginationDto, @Req() request: ZautoRequest)
    {
        if(request.user && request.user.orgId)
        {
            const orgId = request.user.orgId;
            return await this.visitorService.findAllByOrg({orgId,data:paginationDto});
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

  @Get(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: Visitor})
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    if(request.user && request.user.orgId) {
      const orgId = request.user.orgId;
      return await this.visitorService.findOne(orgId, id);
    }
  }

  @Patch(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: Visitor})
  async update(@Param('id') id: string, @Body() updateVisitorDto: UpdateVisitorDto, @Req() request: ZautoRequest) {
    if(request.user && request.user.orgId) {
      const orgId = request.user.orgId;
      return await this.visitorService.update({orgId, id, data:updateVisitorDto});
    }
  }

  @Delete(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    if(request.user && request.user.orgId) {
      const orgId = request.user.orgId;
      return await this.visitorService.remove(orgId, id);
    }
  }
}
