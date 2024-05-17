import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, Req, UnauthorizedException } from '@nestjs/common';
import { AgentPromptService } from './agent-prompt.service';
import { CreateAgentPromptDto } from './dto/create-agent-prompt.dto';
import { UpdateAgentPromptDto } from './dto/update-agent-prompt.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AgentPrompt } from './entities/agent-prompt.entity';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { ZautoRequest } from 'src/common/models/request.model';

@Controller('api/agent-prompts')
@ApiTags('AgentPrompt')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AgentPromptController {
  constructor(private readonly agentpromptService: AgentPromptService) {}

  @Post()
  @ApiBody({ type: AgentPrompt })
  @ApiCreatedResponse({type: AgentPrompt})
  async create(@Body() createAgentPromptDto: CreateAgentPromptDto) {
    return await this.agentpromptService.create(createAgentPromptDto);
  }

  @Get()
  @ApiResponse({
    type: ResponseDTO<AgentPrompt>
  })
  async find(@Req() request: ZautoRequest) {
    if(request.user)
    {
      const orgId = request.orgId;
      return await this.agentpromptService.getPromptByOrg(orgId);
    }
    else
    {
      throw new UnauthorizedException();
    }
  }

  @Get(':id')
  @ApiOkResponse({type: AgentPrompt})
  async findOne(@Param('id') id: string) {
    return await this.agentpromptService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({type: AgentPrompt})
  async update(@Param('id') id: string, @Body() updateAgentPromptDto: UpdateAgentPromptDto) {
    return await this.agentpromptService.update(id, updateAgentPromptDto);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.agentpromptService.remove(id);
  }
}
