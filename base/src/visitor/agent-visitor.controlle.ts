import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, Req, UnauthorizedException } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Visitor } from './entities/visitor.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ZautoRequest } from 'src/common/models/request.model';


@ApiTags('Visitors')
@Controller('api/:agentId/visitors')
export class AgentVisitorController {
  constructor(private readonly visitorService: VisitorService) {}



  @Get()
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiResponse({
    type: ResponseDTO<Visitor>
  })
  async findAll(@Param('agentId') agentId: string, @Query() paginationDto: PaginationDto, @Req() request: ZautoRequest) {
    if(request.user && request.user.orgId)
    {
      const orgId = request.user.orgId;
      return await this.visitorService.findAllByAgent({orgId,agentId,data:paginationDto});
    }
    else
    {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }
}
