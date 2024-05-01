import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, BadRequestException } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConversationService } from 'src/conversation/conversation.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Lead } from './entities/lead.entity';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ValidateEmailDto } from './dto/validate-email.dto';


@ApiTags('Leads')
@Controller('api')
export class AgentLeadController {
  
  constructor(private readonly leadService: LeadService,
    private readonly convService: ConversationService) {}

  @Post(':agentId/leads')
  async create(@Param('agentId') agentId: string, @Body() createLeadDto: CreateLeadDto) {
    createLeadDto.agentId = agentId;
    const converation = await this.convService.findOneNoSummay(createLeadDto.convId);
    if(converation.agentId == agentId) {
      return await this.leadService.create(createLeadDto, converation.orgId);
    } else {
      throw new BadRequestException('Invalid conversation id. agentId for the converation is not matching.');
    }
  }

  @Get(':agentId/leads')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiResponse({
    type: ResponseDTO<Lead>
  })
  async findAll(@Param('agentId') agentId: string, @Query() paginationDto: PaginationDto) {
    return await this.leadService.findAllByAgent(agentId, paginationDto);
  }

  @Post('validate-email')
  async validateEmail(@Param('agentId') agentId: string, @Body() validateEmailDto: ValidateEmailDto)
  {
    return await this.leadService.validateEmail(validateEmailDto);
  }
}
