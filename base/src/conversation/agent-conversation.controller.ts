import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';

import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Conversation } from './entities/conversation.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@ApiTags('Conversations')
@Controller('api/:agentId/conversations')
export class AgentConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiResponse({
    type: ResponseDTO<Conversation>
  })
  async findAllById(@Param('agentId') agentId: string, @Query() paginationDto: PaginationDto) {
    return await this.conversationService.findAllByagentId(agentId, paginationDto);
  } 
}
