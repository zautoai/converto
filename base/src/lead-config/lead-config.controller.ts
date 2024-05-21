import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { LeadConfigService } from './lead-config.service';
import { CreateLeadConfigDto } from './dto/create-lead-config.dto';
import { UpdateLeadConfigDto } from './dto/update-lead-config.dto';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { LeadConfig } from './entities/lead-config.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ZautoRequest } from 'src/common/models/request.model';
import { AgentService } from 'src/agent/agent.service';

@ApiTags('Lead Config')
@Controller('api/:agentId/lead-configs')
export class LeadConfigController {
  constructor(private readonly leadConfigService: LeadConfigService,
    private readonly agentService: AgentService) {}

  @Post()
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Param('agentId') agentId: string, @Body() createLeadConfigDto: CreateLeadConfigDto, @Req() zautoRequest: ZautoRequest) {
    if (zautoRequest.user && zautoRequest.user.orgId) {
      const orgId = zautoRequest.user.orgId;
      return await this.leadConfigService.create(createLeadConfigDto);
    } else {
      throw new UnauthorizedException('You are unauthorized to perform this action')
    }
  }

  // @Get()
  // @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @ApiBearerAuth()
  // @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  // @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  // @ApiOkResponse({
  //   type: ResponseDTO<LeadConfig>
  // })
  // async findAll(@Param('agentId') agentId: string, @Query() paginationDto: PaginationDto, @Req() zautoRequest: ZautoRequest) {
  //   if(zautoRequest && zautoRequest.user) {
  //     const agent = await this.agentService.findOne(agentId);
  //     if(agent && agent.orgId == zautoRequest.orgId) {
  //       return await  this.leadConfigService.findAll(paginationDto);
  //     } else {
  //       throw new UnauthorizedException('You are unauthorized to perform this action.')
  //     }
  //   }
  //   throw new UnauthorizedException('You are unauthorized to perform this action.')
  // }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseDTO<LeadConfig>
  })
  async findOneByAgent(@Param('agentId') agentId: string, @Req() zautoRequest: ZautoRequest) {
    if(zautoRequest.user && zautoRequest.user.orgId) {
      return await  this.leadConfigService.findByAgent(agentId);
    }
    throw new UnauthorizedException('You are unauthorized to perform this action.')
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('agentId') agentId: string, @Param('id') id: string, @Req() zautoRequest: ZautoRequest) {
    if(zautoRequest.user && zautoRequest.user.orgId) {
      return await  this.leadConfigService.findOne(id);
    }
    throw new UnauthorizedException('You are unauthorized to perform this action.')
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('agentId') agentId: string, @Param('id') id: string,
   @Body() updateLeadConfigDto: UpdateLeadConfigDto, @Req() zautoRequest: ZautoRequest) {
    if(zautoRequest.user && zautoRequest.user.orgId) {
      return await  this.leadConfigService.update(id, updateLeadConfigDto)
    }
    throw new UnauthorizedException('You are unauthorized to perform this action.')
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('agentId') agentId: string, @Param('id') id: string,  @Req() zautoRequest: ZautoRequest) {
    if(zautoRequest.user && zautoRequest.user.orgId) {
      return await  this.leadConfigService.remove(id)
    }
    throw new UnauthorizedException('You are unauthorized to perform this action.')
  }
}
