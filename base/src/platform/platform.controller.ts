import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Platform } from './entities/platform.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePlatformDto } from './dto/create-platform.dto';

@ApiTags('Platforms')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/platforms')
export class PlatformController {

    constructor(private readonly platformService:PlatformService)
    {

    }

    @Post()
    async create(@Body() createPlatformDto: CreatePlatformDto)
    {
        return await this.platformService.create(createPlatformDto);
    }
    
    @Get()
    @ApiResponse({type:ResponseDTO<Platform>})
    async findAllPlatforms()
    {
        return await this.platformService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({type:Platform})
    async findOne(@Param('id') id:string)
    {
        return await this.platformService.findOne(id);
    }

    @Patch(':id')
    @ApiOkResponse({type:Platform})
    async update(@Param('id') id: string, @Body() updatePlatformDto: CreatePlatformDto)
    {
        return await this.platformService.update(id,updatePlatformDto);
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(@Param('id') id: string)
    {
        return await this.platformService.delete(id);
    }
}
