import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrgPlatformService } from './org-platform.service';
import { ZautoRequest } from 'src/common/models/request.model';
import { CreateOrgPlatformDto } from './dto/create-orgPlatform.dto';
import { OrgPlatform } from './entity/org-platform.entity';

@ApiTags('OrgPlatforms')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/org-platforms')
export class OrgPlatformController {

    constructor(private readonly orgPlatformService: OrgPlatformService){

    }

    @Post()
    async create(@Body() createOrgPlatfoDto:CreateOrgPlatformDto,@Req() zautoRequest: ZautoRequest)
    {
        if(zautoRequest.user && zautoRequest.user.org)
        {
            createOrgPlatfoDto.orgId = zautoRequest.user.org.id;
            return await this.orgPlatformService.create(createOrgPlatfoDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get()
    async findAll(@Req() zautoRequest: ZautoRequest)
    {        
        return await this.orgPlatformService.findAllByOrg(zautoRequest.user.org.id);
    }

    @Get(':id')
    @ApiOkResponse({type:OrgPlatform})
    async findOne(@Param('id') id:string)
    {
        return await this.orgPlatformService.findOne(id);
    }

    @Patch(':id')
    @ApiOkResponse({type:OrgPlatform})
    async update(@Param('id') id:string,@Body() updatePlateformDto:CreateOrgPlatformDto)
    {
        return await this.orgPlatformService.update(id,updatePlateformDto);
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(@Param('id') id:string)
    {
        return await this.orgPlatformService.delete(id);
    }
    
}
