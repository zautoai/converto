import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SiteService } from './site.service';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Site } from './entities/site.entity';




@ApiTags('Sites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/agents/:agentId/sites')
export class AgentSiteController {
  constructor(private readonly siteService: SiteService) {}

  
  @Get()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiOkResponse({
    type: ResponseDTO<Site>
  })
  async findAll(@Param('agentId') agentId: string, @Query() paginationDto: PaginationDto) {
    return await this.siteService.findAllByAgent(agentId, paginationDto);
  }
}
