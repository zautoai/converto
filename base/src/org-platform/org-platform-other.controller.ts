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

@ApiTags('OrgPlatformsOther')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/org-platforms-other')
export class OrgPlatformOtherController {

    constructor(private readonly orgPlatformService: OrgPlatformService){

    }

    @Post()
    async create(@Body() createOrgPlatfoDto:CreateOrgPlatformDto,@Req() zautoRequest: ZautoRequest)
    {
        if(zautoRequest.user && zautoRequest.user.org)
        {
            createOrgPlatfoDto.orgId = zautoRequest.user.org.id;
            return await this.orgPlatformService.createOther(createOrgPlatfoDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    
}
