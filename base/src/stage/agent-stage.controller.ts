import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards,Req } from '@nestjs/common';
import {UnauthorizedException} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { Stage } from './entities/stage.entity';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StageService } from './stage.service';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('Stages')
@Controller('api/:agentId/stages')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AgentStageController 
{
    constructor(private readonly stageService:StageService){}
    
    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    @ApiResponse({
        type: ResponseDTO<Stage>
    })
    async findAll(@Param('agentId') agentId: string,@Query() paginationDto: PaginationDto)
    {

        return await this.stageService.findAllByAgent(agentId,paginationDto);
    }

    @Post()
    @ApiOkResponse({type:Stage})
    async create(@Param('agentId') agentId: string, @Body() createStageDto: CreateStageDto,@Req() zautoRequest: ZautoRequest)
    {
        if(zautoRequest.user && zautoRequest.orgId)
        {
            createStageDto.orgId = zautoRequest.orgId;
            createStageDto.agentId = agentId;
            return await this.stageService.create(createStageDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Post('/sequence')
    async updateSquence(@Param('agentId') agentId: string, @Body() updateSequenceDto: any)
    {
        return this.stageService.updateSquence(agentId, updateSequenceDto);
    }
    
}
