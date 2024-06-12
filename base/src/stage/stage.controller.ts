import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { StageService } from './stage.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Stage } from './entities/stage.entity';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('Stages')
@Controller('api/stages')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StageController {
    constructor(private readonly stageService: StageService) { }

    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    @ApiOkResponse({
        type: ResponseDTO<Stage>
    })
    async findAll(@Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.stageService.findAllByOrg(orgId);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':id')
    @ApiOkResponse({ type: Stage })
    async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.stageService.findOne(orgId, id);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Post()
    @ApiOkResponse({ type: Stage })
    async create(@Body() createStageDto: CreateStageDto, @Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.user.orgId) {
            const orgId = zautoRequest.user.orgId;
            return await this.stageService.create({ orgId, data: createStageDto });
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Patch(':id')
    @ApiOkResponse({ type: Stage })
    async update(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto, @Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.user.orgId) {
            const orgId = zautoRequest.user.orgId;
            return await this.stageService.update({ orgId, id, data: updateStageDto });
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }


    @Delete(':id')
    @HttpCode(204)
    async delete(@Param('id') id: string, @Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.user.orgId) {
            const orgId = zautoRequest.user.orgId;
            return await this.stageService.delete(orgId, id);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Post('/sequence')
    async updateSquence(@Body() updateSquence: any, @Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.user.orgId) {
            const orgId = zautoRequest.user.orgId;
            return await this.stageService.updateSquence({ orgId, data: { updateSquence } });
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

}
