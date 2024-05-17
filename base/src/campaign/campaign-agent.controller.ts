import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { CreateCampaignDto } from './dto/create-campaign.dot';
import { ZautoRequest } from 'src/common/models/request.model';
import { CampaignService } from './campaign.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Campaigns')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/:agentId/campaigns')
export class CampaignAgentController 
{

    constructor(private readonly campaignService:CampaignService,)
    {}

    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    async findAll(@Param('agentId') agentId: string,@Query() paginationDto: PaginationDto,@Req() zautoRequest: ZautoRequest)
    {
        if(zautoRequest.user && zautoRequest.orgId)
        {
            return await this.campaignService.findAllByAgent(agentId,paginationDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }
    
}
